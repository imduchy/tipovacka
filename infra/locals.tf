locals {
  default_tags = {
    project      = var.project_name
    region       = var.region
    environment  = var.environment
    managed_with = var.managed_with
  }
}
