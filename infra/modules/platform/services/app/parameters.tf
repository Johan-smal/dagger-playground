resource "aws_ssm_parameter" "app_container_tag" {
  name        = "/app/container/tag"
  description = "The tag for the application container image"
  type        = "String"
  value       = "latest"
  overwrite   = true
  lifecycle {
    ignore_changes = [
      value, # Ignore changes to the value of the parameter
    ]
  }
}
