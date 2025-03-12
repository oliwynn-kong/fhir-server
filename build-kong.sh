
echo "Building Kong Gateway"
echo "====================="

echo "linting the OAS file with insomnia..."
inso lint spec OAS.yaml

echo "====================="
echo "Generating Kong Gateway configuration from OAS file..."
echo
echo

deck file openapi2kong -s OAS.yaml -o kong.yaml

echo "====================="

echo "Merging the Kong Gateway configuration with the consumers..."
echo
echo

deck file merge consumers.yaml kong.yaml -o kong.yaml
deck file add-plugins add-plugins.yaml -s kong.yaml -o kong.yaml

echo "====================="
echo "Validating the Kong Gateway configuration..."
echo
echo
deck file validate kong.yaml

echo "====================="
echo "Applying the Kong Gateway configuration..."
echo
echo    
#deck gateway diff --konnect-addr https://us.api.konghq.com/ --konnect-control-plane-name HealthcareGateway --konnect-token-file $HOME/.konnect_token kong.yaml
deck gateway sync --konnect-addr https://us.api.konghq.com/ --konnect-control-plane-name HealthcareGateway --konnect-token-file $HOME/.konnect_token kong.yaml

echo "====================="
echo "Kong Gateway configuration applied successfully!"
echo



#deck gateway dump --konnect-addr https://us.api.konghq.com/ --konnect-control-plane-name HealthcareGateway --konnect-token-file $HOME/.konnect_token -o kong-dump.yaml

#deck gateway reset --konnect-control-plane-name HealthcareGateway --konnect-token-file $HOME/.konnect_token -f