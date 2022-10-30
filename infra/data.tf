data "azuread_client_config" "current" {}

data "azurerm_cosmosdb_account" "this" {
  name                = "tipovacka-master"
  resource_group_name = "tipovacka"
}
