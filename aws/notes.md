How to Use This CloudFormation Template

Save the template to a file (e.g., deepseek-ollama.yaml)
Deploy through AWS Console:

Go to CloudFormation service
Click "Create stack" → "With new resources (standard)"
Upload the template file
Fill in the parameters (your SSH key name, your IP address for secure access)

Or deploy via AWS CLI:
bashCopyaws cloudformation create-stack \
 --stack-name deepseek-ollama \
 --template-body file://deepseek-ollama.yaml \
 --parameters ParameterKey=KeyName,ParameterValue=your-key-name ParameterKey=YourIP,ParameterValue=your-ip/32

What This Does

Automatically deploys a GPU-enabled EC2 instance (default: g4dn.xlarge)
Installs all required drivers and dependencies
Sets up Docker with NVIDIA support
Installs Ollama as a systemd service
Automatically pulls the DeepSeek-R1 model
Creates security groups with proper port access
Outputs the endpoint URL for API access

IF USING CF AND DOCKERFILE

Yes, you can absolutely do that! It's a great approach that combines the strengths of both methods. Here's how you could structure it:
CloudFormation Template Using Custom DockerfileClick to open codeTap to open
How This Works
This approach combines the best of both worlds:

CloudFormation provisions the infrastructure:

Creates the EC2 instance with GPU capabilities
Sets up security groups and networking
Installs Docker and NVIDIA drivers

Custom Dockerfile defines the application:

The CloudFormation template creates a Dockerfile on the EC2 instance
This Dockerfile is the same one I provided earlier, with your DeepSeek-R1 configuration
The instance builds the Docker image and runs it as a systemd service

Advantages of This Approach

Separation of concerns:

Infrastructure configuration stays in CloudFormation
Application configuration stays in the Dockerfile

Flexibility:

You can easily modify the Dockerfile without changing infrastructure
You can reuse the same Dockerfile across different environments

Maintainability:

Clear distinction between infrastructure and application code
Easier to troubleshoot each component separately

Portability:

The Dockerfile can be used in other environments if needed

To deploy, use the same CloudFormation deployment process as mentioned earlier. Once deployed, the EC2 instance will automatically build the Docker image and run the container with your DeepSeek-R1 model accessible on port 11435.

ANY DIFFERENCES IN PERFORMANCE?

There are no significant performance differences between the two CloudFormation templates. Both will result in essentially the same runtime performance for the DeepSeek-R1 model because:

Same underlying technology: Both approaches use Docker to run Ollama with DeepSeek-R1 on the same GPU hardware.
Same resource allocation: Both templates provision identical EC2 instances with the same GPU resources.
Same container runtime: Both use Docker with NVIDIA GPU passthrough, which has the same performance characteristics.

The minor differences are:

Build process: The second template (with explicit Dockerfile) builds the Docker image on the EC2 instance, which takes a few extra seconds during setup, but doesn't affect runtime performance.
Implementation details: The first template pulls the Ollama image and runs commands directly, while the second builds a custom image with those commands baked in. This is an implementation difference, not a performance difference.
Maintenance approach: The Dockerfile version might be easier to update if you need to change how the model runs, but this is a maintainability advantage, not a performance one.

For all practical purposes, the DeepSeek-R1 model will run with identical performance in both setups because the underlying hardware, drivers, and container runtime environment are the same. The choice between the two approaches should be based on your preference for maintenance and how you plan to manage the deployment, not performance concerns.
