#!/usr/bin/env bash
set -euo pipefail

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8180}"
KEYCLOAK_ADMIN_USER="${KEYCLOAK_ADMIN_USER:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
REALM="${KEYCLOAK_REALM:-autonomo-pro}"

echo "Obtendo token administrativo..."
ADMIN_TOKEN=$(
  curl -sS -X POST "${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=${KEYCLOAK_ADMIN_USER}" \
    -d "password=${KEYCLOAK_ADMIN_PASSWORD}" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" | jq -r '.access_token'
)

if [[ -z "${ADMIN_TOKEN}" || "${ADMIN_TOKEN}" == "null" ]]; then
  echo "Falha ao autenticar no Keycloak."
  exit 1
fi

AUTH_HEADER=("Authorization: Bearer ${ADMIN_TOKEN}")

echo "Criando realm ${REALM}..."
curl -sS -o /dev/null -w "%{http_code}" \
  -X POST "${KEYCLOAK_URL}/admin/realms" \
  -H "${AUTH_HEADER[0]}" \
  -H "Content-Type: application/json" \
  -d "{\"realm\":\"${REALM}\",\"enabled\":true}" | grep -Eq "201|409"

create_client() {
  local payload=$1
  local client_id=$2

  curl -sS -o /dev/null -w "%{http_code}" \
    -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/clients" \
    -H "${AUTH_HEADER[0]}" \
    -H "Content-Type: application/json" \
    -d "${payload}" | grep -Eq "201|409"

  curl -sS "${KEYCLOAK_URL}/admin/realms/${REALM}/clients?clientId=${client_id}" \
    -H "${AUTH_HEADER[0]}" | jq -r '.[0].id'
}

echo "Criando clients..."
FRONTEND_CLIENT_ID=$(
  create_client \
    '{"clientId":"autonomo-pro-frontend","enabled":true,"publicClient":true,"redirectUris":["http://localhost:3000/*"],"webOrigins":["http://localhost:3000"]}' \
    "autonomo-pro-frontend"
)

BACKEND_CLIENT_ID=$(
  create_client \
    '{"clientId":"autonomo-pro-backend","enabled":true,"publicClient":false,"serviceAccountsEnabled":true,"directAccessGrantsEnabled":true}' \
    "autonomo-pro-backend"
)

create_role() {
  local role_name=$1
  curl -sS -o /dev/null -w "%{http_code}" \
    -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/roles" \
    -H "${AUTH_HEADER[0]}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${role_name}\"}" | grep -Eq "201|409"
}

echo "Criando roles..."
create_role "corp_admin"
create_role "unit_operator"
create_role "auditor"

echo "Criando protocol mapper tenant_id..."
curl -sS -o /dev/null -w "%{http_code}" \
  -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/clients/${FRONTEND_CLIENT_ID}/protocol-mappers/models" \
  -H "${AUTH_HEADER[0]}" \
  -H "Content-Type: application/json" \
  -d '{"name":"tenant_id","protocol":"openid-connect","protocolMapper":"oidc-usermodel-attribute-mapper","consentRequired":false,"config":{"userinfo.token.claim":"true","user.attribute":"tenant_id","id.token.claim":"true","access.token.claim":"true","claim.name":"tenant_id","jsonType.label":"String"}}' | grep -Eq "201|409"

create_user() {
  local email=$1
  local name=$2
  local role=$3
  local tenant_id=$4

  curl -sS -o /dev/null -w "%{http_code}" \
    -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/users" \
    -H "${AUTH_HEADER[0]}" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${email}\",\"email\":\"${email}\",\"firstName\":\"${name}\",\"enabled\":true,\"attributes\":{\"tenant_id\":[\"${tenant_id}\"]},\"credentials\":[{\"type\":\"password\",\"value\":\"autonomo123\",\"temporary\":false}]}" | grep -Eq "201|409"

  local user_id
  user_id=$(
    curl -sS "${KEYCLOAK_URL}/admin/realms/${REALM}/users?username=${email}" \
      -H "${AUTH_HEADER[0]}" | jq -r '.[0].id'
  )
  local role_payload
  role_payload=$(
    curl -sS "${KEYCLOAK_URL}/admin/realms/${REALM}/roles/${role}" \
      -H "${AUTH_HEADER[0]}"
  )

  curl -sS -o /dev/null -w "%{http_code}" \
    -X POST "${KEYCLOAK_URL}/admin/realms/${REALM}/users/${user_id}/role-mappings/realm" \
    -H "${AUTH_HEADER[0]}" \
    -H "Content-Type: application/json" \
    -d "[${role_payload}]" | grep -Eq "204|409"
}

echo "Criando usuários de teste..."
create_user "admin@autonomo.pro" "Admin" "corp_admin" ""
create_user "operador@ufrj.br" "Operador UFRJ" "unit_operator" "ufrj"
create_user "auditor@autonomo.pro" "Auditor" "auditor" ""

echo "Setup Keycloak concluído. Realm: ${REALM}, backend client id: ${BACKEND_CLIENT_ID}"
