resource "azurerm_resource_group" "this" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.region
  tags     = local.default_tags
}

resource "azurerm_container_registry" "this" {
  name                = "cr${var.project_name}shared"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.region
  tags                = local.default_tags

  sku           = "Basic"
  admin_enabled = false
}

resource "azurerm_log_analytics_workspace" "this" {
  name                = "log-${var.project_name}-shared"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.region
  tags                = local.default_tags

  sku               = "PerGB2018" # Default
  retention_in_days = 30
}

resource "azurerm_application_insights" "this" {
  name                = "appi-${var.project_name}-shared"
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
  application_type    = "web"
}

