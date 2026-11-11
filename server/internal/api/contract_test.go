package api_test

// Checks the hand-written contract in api/openapi.yaml (CR-0001.T04):
// it validates as OpenAPI 3.0, every operation names the requirements it
// serves, no response carries a phone number and only the caller's own
// sign-up carries a birth date (NFR-PRIV-002), and the code request has one
// success answer without account-dependent fields (NFR-SEC-003).
//
// spec: ADR-0004

import (
	"context"
	"regexp"
	"sort"
	"testing"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const contractPath = "../../../api/openapi.yaml"

func loadContract(t *testing.T) *openapi3.T {
	t.Helper()
	loader := openapi3.NewLoader()
	doc, err := loader.LoadFromFile(contractPath)
	require.NoError(t, err)
	return doc
}

func TestContract_Validates(t *testing.T) {
	doc := loadContract(t)
	require.NoError(t, doc.Validate(context.Background()))
	assert.Regexp(t, `^3\.0\.\d+$`, doc.OpenAPI)
}

var requirementID = regexp.MustCompile(`\b(ONB-\d{3}|NFR-[A-Z]+-\d{3}|ADR-\d{4})\b`)

func TestContract_EveryOperationNamesItsRequirements(t *testing.T) {
	doc := loadContract(t)
	for path, item := range doc.Paths.Map() {
		for method, op := range item.Operations() {
			assert.Regexp(t, requirementID, op.Description, "%s %s names no requirement ID", method, path)
			assert.NotEmpty(t, op.OperationID, "%s %s has no operationId", method, path)
		}
	}
}

// propertyNames collects every property name reachable from a schema, with
// the name of the component schema it belongs to.
func propertyNames(ref *openapi3.SchemaRef, owner string, seen map[*openapi3.Schema]bool, out map[string][]string) {
	if ref == nil || ref.Value == nil || seen[ref.Value] {
		return
	}
	s := ref.Value
	seen[s] = true
	if ref.Ref != "" {
		owner = ref.Ref
	}
	for name, p := range s.Properties {
		out[name] = append(out[name], owner)
		propertyNames(p, owner, seen, out)
	}
	propertyNames(s.Items, owner, seen, out)
	for _, list := range []openapi3.SchemaRefs{s.OneOf, s.AnyOf, s.AllOf} {
		for _, sub := range list {
			propertyNames(sub, owner, seen, out)
		}
	}
}

func TestContract_ResponsesKeepPhoneAndBirthDatePrivate(t *testing.T) {
	doc := loadContract(t)
	props := map[string][]string{}
	for _, item := range doc.Paths.Map() {
		for _, op := range item.Operations() {
			for _, resp := range op.Responses.Map() {
				for _, media := range resp.Value.Content {
					propertyNames(media.Schema, "", map[*openapi3.Schema]bool{}, props)
				}
			}
		}
	}

	assert.Empty(t, props["phoneNumber"], "no response may carry a phone number (NFR-PRIV-002)")
	owners := map[string]bool{}
	for _, o := range props["birthDate"] {
		owners[o] = true
	}
	var list []string
	for o := range owners {
		list = append(list, o)
	}
	sort.Strings(list)
	assert.Equal(t, []string{"#/components/schemas/SignUp"}, list,
		"only the caller's own sign-up may carry a birth date (NFR-PRIV-002)")
}

func TestContract_CodeRequestAnswersAlike(t *testing.T) {
	doc := loadContract(t)
	op := doc.Paths.Find("/login/code-requests").Post
	require.NotNil(t, op)

	var success []string
	for code := range op.Responses.Map() {
		if code[0] == '2' {
			success = append(success, code)
		}
	}
	assert.Equal(t, []string{"202"}, success, "one success answer for known and unknown numbers (NFR-SEC-003)")

	schema := op.Responses.Value("202").Value.Content.Get("application/json").Schema.Value
	var names []string
	for name := range schema.Properties {
		names = append(names, name)
	}
	sort.Strings(names)
	assert.Equal(t, []string{"codeValidForSeconds", "resendAfterSeconds"}, names,
		"the success answer carries nothing that depends on the account (NFR-SEC-003)")
}
