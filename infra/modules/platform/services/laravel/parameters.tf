resource "aws_ssm_parameter" "laravel_container_tag" {
  name        = "/laravel/container/tag"
  description = "The tag for the Laravel container image"
  type        = "String"
  value       = "latest"
  overwrite   = true
  lifecycle {
    ignore_changes = [
      value, # Ignore changes to the value of the parameter
    ]
  }
}
