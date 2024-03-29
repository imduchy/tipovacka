resource "azurerm_storage_account" "engine" {
  name                     = "st${var.project_name}engine${var.environment}"
  resource_group_name      = azurerm_resource_group.this.name
  location                 = azurerm_resource_group.this.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = local.default_tags
}

resource "azurerm_service_plan" "this" {
  name                = "asp-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  os_type             = "Linux"
  sku_name            = "Y1"
  tags                = local.default_tags
}

resource "azurerm_linux_function_app" "example" {
  name                = "func-${var.project_name}-engine-${var.environment}"
  resource_group_name = azurerm_resource_group.this.name
  location            = azurerm_resource_group.this.location
  tags                = local.default_tags

  storage_account_name       = azurerm_storage_account.engine.name
  storage_account_access_key = azurerm_storage_account.engine.primary_access_key
  service_plan_id            = azurerm_service_plan.this.id

  functions_extension_version = "~4"
  https_only                  = true

  site_config {
    always_on                = false
    http2_enabled            = true
    application_insights_key = azurerm_application_insights.this.instrumentation_key

    application_stack {
      node_version = 14
    }
  }

  identity {
    type = "SystemAssigned"
  }

  app_settings = {
    API_FOOTBALL_HOST             = "v3.football.api-sports.io"
    KEY_VAULT_URL                 = azurerm_key_vault.this.vault_uri
    CONNECTION_STRING_SECRET_NAME = "DB-CONNECTION-STRING"
  }

  lifecycle {
    ignore_changes = [
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}
