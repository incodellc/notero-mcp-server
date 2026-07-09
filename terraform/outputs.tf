output "instance_id" {
  description = "EC2 instance ID of the Notero MCP server."
  value       = aws_instance.mcp_server.id
}

output "instance_public_ip" {
  description = "Public IP address of the Notero MCP server."
  value       = local.mcp_public_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the Notero MCP server."
  value       = aws_instance.mcp_server.public_dns
}

output "mcp_endpoint_url" {
  description = "Base MCP HTTP endpoint URL until HTTPS is configured."
  value       = "http://${local.mcp_public_ip}:${var.mcp_server_port}/mcp"
}

output "health_check_url" {
  description = "Health check endpoint URL."
  value       = "http://${local.mcp_public_ip}:${var.mcp_server_port}/health"
}

output "route53_record_fqdn" {
  description = "Route53 record FQDN when DNS is enabled."
  value       = var.enable_route53_record ? aws_route53_record.mcp_server[0].fqdn : null
}

output "security_group_id" {
  description = "Security group attached to the MCP server instance."
  value       = aws_security_group.mcp_server.id
}

output "ssh_command" {
  description = "Example SSH command for post-deployment secret generation."
  value       = "ssh -i <path-to-private-key> ec2-user@${local.mcp_public_ip}"
}
