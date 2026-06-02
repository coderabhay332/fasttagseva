# AWS Resource Cleanup Guide

## Quick Cleanup

```powershell
# Run the automated cleanup script
.\cleanup-aws.ps1
```

## Manual Cleanup Commands

### 1. Elastic IPs (Cost: ~$3.60/month each if not attached)
```bash
# List all Elastic IPs
aws ec2 describe-addresses --region ap-south-1

# Release an Elastic IP (replace eipalloc-xxx with your AllocationId)
aws ec2 release-address --allocation-id eipalloc-xxxxxxxx --region ap-south-1
```

### 2. Load Balancers
```bash
# List load balancers
aws elbv2 describe-load-balancers --region ap-south-1

# Delete a load balancer (replace arn:aws:elasticloadbalancing:... with your ARN)
aws elbv2 delete-load-balancer --load-balancer-arn arn:aws:elasticloadbalancing:... --region ap-south-1
```

### 3. Target Groups
```bash
# List target groups
aws elbv2 describe-target-groups --region ap-south-1

# Delete a target group
aws elbv2 delete-target-group --target-group-arn arn:aws:elasticloadbalancing:... --region ap-south-1
```

### 4. Security Groups
```bash
# List security groups
aws ec2 describe-security-groups --region ap-south-1

# Delete a security group (must not be in use)
aws ec2 delete-security-group --group-id sg-xxxxxxxx --region ap-south-1
```

### 5. S3 Buckets (EB deployment artifacts)
```bash
# List buckets
aws s3 ls

# Empty and delete a bucket (DANGER: deletes all data)
aws s3 rb s3://elasticbeanstalk-ap-south-1-777311273153 --force
```

### 6. Elastic Beanstalk Applications
```bash
# List applications
eb apps

# Delete application and all environments
eb delete fasttag-backend --force

# Or terminate just the environment
eb terminate fasttag-backend-prod --force
```

## Cost Check

Check your current AWS bill:
- Go to https://console.aws.amazon.com/billing/home
- Check "Free Tier" usage if applicable
- Most resources should show $0 if properly cleaned up

## Important Notes

- **Elastic IPs**: These cost money if not attached to a running instance (~$3.60/month per IP)
- **Load Balancers**: Cost ~$20/month + data transfer
- **Security Groups**: Free, but good to clean up for organization
- **S3**: Minimal cost for small deployment artifacts, but good to clean up
