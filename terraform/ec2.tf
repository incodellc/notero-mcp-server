resource "aws_security_group" "mcp_server" {
  name        = "notero-mcp-server-sg"
  description = "Allow HTTP access to the Notero MCP server"
  vpc_id      = local.selected_vpc_id

  ingress {
    description = "MCP HTTP access"
    from_port   = var.mcp_server_port
    to_port     = var.mcp_server_port
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  ingress {
    description = "HTTP for nginx / Let's Encrypt"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  ingress {
    description = "HTTPS for nginx"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.allowed_cidr]
  }

  ingress {
    description = "SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "notero-mcp-server-sg"
  }
}

resource "aws_instance" "mcp_server" {
  ami                         = var.ami_id != "" ? var.ami_id : data.aws_ami.default.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  subnet_id                   = var.subnet_id != "" ? var.subnet_id : data.aws_subnets.selected.ids[0]
  vpc_security_group_ids      = [aws_security_group.mcp_server.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size = var.root_volume_size_gb
    volume_type = "gp3"
  }

  user_data = file("${path.module}/user_data.sh")

  tags = {
    Name        = "notero-mcp-server"
    Environment = var.environment
    Service     = "notero-mcp"
  }
}

resource "aws_eip" "mcp_server" {
  count    = var.enable_elastic_ip ? 1 : 0
  domain   = "vpc"
  instance = aws_instance.mcp_server.id

  tags = {
    Name = "notero-mcp-server-eip"
  }
}

resource "aws_route53_record" "mcp_server" {
  count   = var.enable_route53_record ? 1 : 0
  zone_id = data.aws_route53_zone.primary[0].zone_id
  name    = var.route53_record_name
  type    = "A"
  ttl     = 300
  records = [local.mcp_public_ip]
}

locals {
  mcp_public_ip = var.enable_elastic_ip ? aws_eip.mcp_server[0].public_ip : aws_instance.mcp_server.public_ip
}
