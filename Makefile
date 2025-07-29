# Makefile wrapper for new project structure
# This forwards all commands to scripts/Makefile

# Forward all targets to deploy/Makefile
%:
	@$(MAKE) -C deploy $@

.PHONY: help
help:
	@$(MAKE) -C deploy help
