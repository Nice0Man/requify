# Makefile wrapper for new project structure

%:
	@$(MAKE) -C deploy $@

.PHONY: help
help:
	@$(MAKE) -C scripts help
