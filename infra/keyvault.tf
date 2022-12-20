resource "azurerm_key_vault" "this" {
  name                = "kv-${var.project_name}-${var.environment}"
  location            = var.region
  resource_group_name = azurerm_resource_group.this.name
  tags                = local.default_tags

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

resource "azurerm_key_vault_secret" "db_connection_string" {
  name = "DB-CONNECTION-STRING"
  tags = local.default_tags

  value        = "mongodb://${data.azurerm_cosmosdb_account.this.name}:${data.azurerm_cosmosdb_account.this.primary_key}@${data.azurerm_cosmosdb_account.this.name}.mongo.cosmos.azure.com:10255/tipovacka?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@tipovacka-master@"
  key_vault_id = azurerm_key_vault.this.id
}

resource "azurerm_key_vault_secret" "football_api_key" {
  name = "FOOTBALL-API-KEY"
  tags = local.default_tags

  value        = "replace-me"
  key_vault_id = azurerm_key_vault.this.id

  lifecycle {
    ignore_changes = [
      value
    ]
  }
}
