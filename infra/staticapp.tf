resource "azurerm_static_site" "client_static_app" {
  name                = "stapp-${var.project_name}-client-${var.environment}"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.region
  tags                = local.default_tags

  sku_tier = "Free"
  sku_size = "Free"
}
