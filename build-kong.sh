deck file openapi2kong -s OAS.yaml -o kong.yaml

deck gateway sync --konnect-addr https://us.api.konghq.com/ --konnect-control-plane-name HealthcareGateway --konnect-token-file $HOME/.konnect_token kong.yaml

deck gateway dump --konnect-addr https://us.api.konghq.com/ --konnect-control-plane-name HealthcareGateway --konnect-token-file $HOME/.konnect_token -o kong-dump.yaml

deck gateway reset --konnect-control-plane-name HealthcareGateway --konnect-token-file $HOME/.konnect_token -f