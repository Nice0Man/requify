#!/usr/bin/env python3
"""
Universal script to refactor all endpoint files to use new dependency system.
"""

import os
import re
import glob

# Mapping of old dependencies to new ones
DEPENDENCY_MAPPING = {
    'from app.api.deps import': 'from app.api.dependencies import',
    'get_db': 'SessionDep',
    'AsyncSession = Depends(get_db)': 'SessionDep',
    'get_users_read_user': 'UserPermissions.read()',
    'get_users_write_user': 'UserPermissions.write()',
    'get_users_delete_user': 'UserPermissions.delete()',
    'get_projects_read_user': 'ProjectPermissions.read()',
    'get_projects_write_user': 'ProjectPermissions.write()',
    'get_projects_delete_user': 'ProjectPermissions.delete()',
    'get_requirements_read_user': 'RequirementPermissions.read()',
    'get_requirements_write_user': 'RequirementPermissions.write()',
    'get_requirements_delete_user': 'RequirementPermissions.delete()',
    'get_releases_read_user': 'ReleasePermissions.read()',
    'get_releases_write_user': 'ReleasePermissions.write()',
    'get_releases_delete_user': 'ReleasePermissions.delete()',
    'get_testing_read_user': 'TestingPermissions.read()',
    'get_testing_write_user': 'TestingPermissions.write()',
    'get_testing_execute_user': 'TestingPermissions.execute()',
    'get_admin_read_user': 'AdminPermissions.read()',
    'get_admin_write_user': 'AdminPermissions.write()',
    'get_admin_user': 'AdminPermissions.write()',
    'get_dashboard_admin_user': 'AdminPermissions.analytics()',
}

def update_imports(content):
    """Update import statements."""
    
    # Replace main import
    content = re.sub(
        r'from app\.api\.deps import \(',
        'from app.api.dependencies import (',
        content
    )
    
    # Add new imports if needed
    new_imports = set()
    if 'UserPermissions' in content:
        new_imports.add('UserPermissions')
    if 'ProjectPermissions' in content:
        new_imports.add('ProjectPermissions')
    if 'RequirementPermissions' in content:
        new_imports.add('RequirementPermissions')
    if 'ReleasePermissions' in content:
        new_imports.add('ReleasePermissions')
    if 'TestingPermissions' in content:
        new_imports.add('TestingPermissions')
    if 'AdminPermissions' in content:
        new_imports.add('AdminPermissions')
    if 'SessionDep' in content:
        new_imports.add('SessionDep')
    
    # Update import block
    import_pattern = r'from app\.api\.dependencies import \((.*?)\)'
    match = re.search(import_pattern, content, re.DOTALL)
    if match:
        current_imports = match.group(1)
        # Clean up and add new imports
        imports_list = [imp.strip().rstrip(',') for imp in current_imports.split('\n') if imp.strip()]
        imports_list.extend(new_imports)
        imports_list = list(set(imports_list))  # Remove duplicates
        imports_list = [imp for imp in imports_list if imp]  # Remove empty
        
        new_import_block = 'from app.api.dependencies import (\n'
        for imp in sorted(imports_list):
            new_import_block += f'    {imp},\n'
        new_import_block += ')'
        
        content = re.sub(import_pattern, new_import_block, content, flags=re.DOTALL)
    
    return content

def update_dependencies(content):
    """Update dependency usage."""
    
    # Replace db parameter
    content = re.sub(
        r'db: AsyncSession = Depends\(get_db\),?',
        'db: SessionDep,',
        content
    )
    
    # Replace permission dependencies
    for old_dep, new_dep in DEPENDENCY_MAPPING.items():
        if 'Permissions' in new_dep:
            # Handle function calls
            content = re.sub(
                f'Depends\\({old_dep}\\)',
                f'Depends({new_dep})',
                content
            )
    
    return content

def fix_parameter_order(content):
    """Fix parameter order in function definitions."""
    
    def fix_single_function(match):
        func_def = match.group(0)
        lines = func_def.split('\n')
        
        if len(lines) < 3:
            return func_def
        
        # Extract function signature
        func_line = lines[0]
        param_lines = []
        closing_line = ""
        
        for i, line in enumerate(lines[1:], 1):
            stripped = line.strip()
            if stripped.endswith('):') or stripped.endswith(') ->'):
                if stripped.startswith('):') or stripped.startswith(') ->'):
                    closing_line = line
                else:
                    param_lines.append(stripped.rstrip(','))
                    closing_line = line
                break
            elif stripped:
                param_lines.append(stripped.rstrip(','))
        
        if not param_lines:
            return func_def
        
        # Categorize parameters
        required_params = []
        optional_params = []
        
        for param in param_lines:
            # Check if parameter has default value
            if '=' in param and ('Depends(' in param or 'None' in param or 'Query(' in param or 'Path(' in param):
                optional_params.append(param)
            else:
                required_params.append(param)
        
        # Reconstruct function
        new_lines = [func_line]
        
        # Add required parameters first
        for param in required_params:
            new_lines.append(f'    {param},')
        
        # Add optional parameters
        for param in optional_params:
            new_lines.append(f'    {param},')
        
        # Add closing
        new_lines.append(closing_line)
        
        return '\n'.join(new_lines)
    
    # Find and fix all async function definitions
    pattern = r'async def \w+\([^)]*\)(?:\s*->\s*[^:]+)?:'
    content = re.sub(pattern, fix_single_function, content, flags=re.MULTILINE | re.DOTALL)
    
    return content

def process_file(filepath):
    """Process a single endpoint file."""
    print(f"Processing {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if already uses new system
        if 'from app.api.dependencies import' in content and 'from app.api.deps import' not in content:
            print(f"  Already using new dependency system")
            return True
        
        # Apply transformations
        content = update_imports(content)
        content = update_dependencies(content)
        content = fix_parameter_order(content)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"  ✅ Updated successfully")
        return True
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def main():
    """Main function."""
    endpoint_files = glob.glob('app/api/v1/endpoints/*.py')
    endpoint_files = [f for f in endpoint_files if not f.endswith('__init__.py')]
    
    print(f"Found {len(endpoint_files)} endpoint files to process:")
    
    success_count = 0
    for filepath in endpoint_files:
        if process_file(filepath):
            success_count += 1
    
    print(f"\n✅ Successfully processed {success_count}/{len(endpoint_files)} files")
    
    # Remove temporary files
    temp_files = ['fix_auth_params.py', 'fix_users_params.py']
    for temp_file in temp_files:
        if os.path.exists(temp_file):
            os.remove(temp_file)
            print(f"Removed temporary file: {temp_file}")

if __name__ == "__main__":
    main()
