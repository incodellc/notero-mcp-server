variable "aws_region" {
  description = "AWS region to deploy the EC2 instance into."
  type        = string
  default     = "eu-central-1"
}

variable "aws_profile" {
  description = "Optional AWS CLI profile name when using shared credentials."
  type        = string
  default     = ""
}

variable "aws_shared_credentials_file" {
  description = "Optional AWS shared credentials file path."
  type        = string
  default     = ""
}

variable "environment" {
  description = "Deployment environment tag for the EC2 instance."
  type        = string
  default     = "development"
}

variable "instance_type" {
  description = "EC2 instance type for the MCP server. t3.micro is enough for initial deployment."
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "Optional EC2 AMI ID to use. If empty, the latest Amazon Linux 2 AMI is used."
  type        = string
  default     = ""
}

variable "key_name" {
  description = "EC2 key pair name for SSH access after deployment."
  type        = string
}

variable "subnet_id" {
  description = "Optional subnet ID to launch the EC2 instance into. Must be a public subnet for external MCP access."
  type        = string
  default     = ""
}

variable "vpc_id" {
  description = "Optional VPC ID for the security group. If empty, the default VPC is used."
  type        = string
  default     = ""
}

variable "allowed_cidr" {
  description = "CIDR block allowed to access the MCP server HTTP port."
  type        = string
  default     = "0.0.0.0/0"
}

variable "ssh_allowed_cidr" {
  description = "CIDR block allowed to SSH into the EC2 instance."
  type        = string
  default     = "0.0.0.0/0"
}

variable "mcp_server_port" {
  description = "TCP port exposed by the Notero MCP server."
  type        = number
  default     = 3001
}

variable "root_volume_size_gb" {
  description = "Root EBS volume size in gigabytes."
  type        = number
  default     = 20
}

variable "enable_elastic_ip" {
  description = "Attach an Elastic IP so the public address survives instance replacement."
  type        = bool
  default     = true
}

variable "enable_route53_record" {
  description = "Create a Route53 A record for the MCP subdomain."
  type        = bool
  default     = false
}

variable "route53_zone_name" {
  description = "Route53 hosted zone name, for example notero.ai."
  type        = string
  default     = "notero.ai"
}

variable "route53_record_name" {
  description = "DNS record name for the MCP server, for example mcp.notero.ai."
  type        = string
  default     = "mcp.notero.ai"
}

variable "alarm_notification_email" {
  description = "Optional email address for CloudWatch alarm notifications."
  type        = string
  default     = ""
}

variable "cpu_alarm_threshold_percent" {
  description = "CPU utilization percentage that triggers a CloudWatch alarm."
  type        = number
  default     = 80
}

variable "disk_alarm_threshold_percent" {
  description = "Disk utilization percentage that triggers a CloudWatch alarm. Requires the CloudWatch agent on the instance."
  type        = number
  default     = 85
}
