resource "azurerm_key_vault" "this" {
  name                       = "kv-${var.project_name}-${var.environment}"
  location                   = var.region
  resource_group_name        = azurerm_resource_group.this.name
  tenant_id                  = data.azuread_client_config.current.tenant_id
  soft_delete_retention_days = 7
  purge_protection_enabled   = true

  sku_name = "standard"
}

resource "azurerm_key_vault_access_policy" "user_identity" {
  key_vault_id = azurerm_key_vault.this.id
  tenant_id    = data.azuread_client_config.current.tenant_id
  object_id    = data.azuread_client_config.current.object_id

  key_permissions = [
    "Backup",
    "Create",
    "Decrypt",
    "Delete",
    "Encrypt",
    "Get",
    "List",
    "Purge",
    "Recover",
    "Restore",
    "Update",
    "Verify",
  ]
  secret_permissions = [
    "Backup",
    "Delete",
    "Get",
    "List",
    "Purge",
    "Recover",
    "Set"
  ]
}

resource "azurerm_key_vault_access_policy" "aca_api" {
  key_vault_id = azurerm_key_vault.this.id
  tenant_id    = data.azuread_client_config.current.tenant_id
  object_id    = azapi_resource.aca-api.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

resource "azurerm_key_vault_access_policy" "aca_client" {
  key_vault_id = azurerm_key_vault.this.id
  tenant_id    = data.azuread_client_config.current.tenant_id
  object_id    = azapi_resource.aca-client.identity[0].principal_id

  secret_permissions = [
    "Get",
    "List"
  ]
}

resource "azurerm_key_vault_secret" "db_connection_string" {
  name         = "DB-CONNECTION-STRING"
  value        = data.azurerm_cosmosdb_account.this.primary_key
  key_vault_id = azurerm_key_vault.this.id
}

resource "azurerm_key_vault_secret" "football_api_key" {
  name         = "FOOTBALL-API-KEY"
  value        = "replace-me"
  key_vault_id = azurerm_key_vault.this.id

  lifecycle {
    ignore_changes = [
      value
    ]
  }
}

resource "random_password" "session_secret" {
  length  = 12
  special = true
}

resource "azurerm_key_vault_secret" "api_session_secret" {
  name         = "SESSION-SECRET"
  value        = random_password.session_secret.result
  key_vault_id = azurerm_key_vault.this.id
}

resource "random_password" "admin_token" {
  length  = 12
  special = true
}

resource "azurerm_key_vault_secret" "api_admin_key" {
  name         = "API-ADMIN-TOKEN"
  value        = random_password.session_secret.result
  key_vault_id = azurerm_key_vault.this.id
}
