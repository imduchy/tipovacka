resource "azurerm_static_site" "landing_page" {
  name                = "stapp-${var.project_name}-landing-${var.environment}"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.region
  tags                = local.default_tags

  sku_tier = "Free"
  sku_size = "Free"
}
