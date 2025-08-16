# Makefile wrapper for new project structure

<<<<<<< HEAD
=======
# Forward all targets to deploy/Makefile
>>>>>>> dev-backend
%:
	@$(MAKE) -C deploy $@

.PHONY: help
help:
	@$(MAKE) -C deploy help
