# Makefile wrapper for new project structure
# This forwards all commands to scripts/Makefile

# Forward all targets to scripts/Makefile
%:
	@$(MAKE) -C scripts $@

.PHONY: help
help:
	@$(MAKE) -C scripts help
