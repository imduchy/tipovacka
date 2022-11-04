resource "azuread_application" "this" {
  display_name = "adapp-${var.project_name}-${var.environment}"
  owners       = [data.azuread_client_config.current.object_id]
}

resource "azuread_service_principal" "this" {
  application_id = azuread_application.this.application_id
  owners         = [data.azuread_client_config.current.object_id]
}

resource "azurerm_role_assignment" "sp_to_container_registry_acrpush" {
  scope                = azurerm_resource_group.this.id
  principal_id         = azuread_service_principal.this.id
  role_definition_name = "Contributor"
}

resource "azurerm_role_assignment" "aca_api_identity_to_container_registry" {
  scope                = azurerm_resource_group.this.id
  principal_id         = azapi_resource.aca-api.identity[0].principal_id
  role_definition_name = "AcrPull"
}
