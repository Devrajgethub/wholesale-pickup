import re, glob

# All component files to update
files = (
    glob.glob('/home/z/my-project/src/components/customer/*.tsx') +
    glob.glob('/home/z/my-project/src/components/admin/*.tsx') +
    ['/home/z/my-project/src/app/page.tsx']
)

# Skip Header (already done) and UI components
skip = ['Header.tsx']
files = [f for f in files if not any(s in f for s in skip)]

# Replacements: (pattern, replacement)
# Order matters - more specific first
replacements = [
    # Backgrounds
    ('bg-gray-50', 'bg-gray-50 dark:bg-[#111827]'),
    ('min-h-screen bg-gray-50', 'min-h-screen bg-gray-50 dark:bg-[#111827]'),
    ('"bg-white rounded', '"bg-white dark:bg-gray-800 rounded'),
    ('"bg-white border', '"bg-white dark:bg-gray-800 border'),
    ('className="bg-white', 'className="bg-white dark:bg-gray-800'),
    ('bg-green-50', 'bg-green-50 dark:bg-green-900/20'),
    ('bg-red-50', 'bg-red-50 dark:bg-red-900/20'),
    ('bg-yellow-50', 'bg-yellow-50 dark:bg-yellow-900/20'),
    ('bg-orange-50', 'bg-orange-50 dark:bg-orange-900/20'),
    ('bg-gray-100', 'bg-gray-100 dark:bg-gray-700'),
    ('bg-gray-200', 'bg-gray-200 dark:bg-gray-700'),
    
    # Text colors
    ('text-gray-900', 'text-gray-900 dark:text-gray-100'),
    ('text-gray-700', 'text-gray-700 dark:text-gray-300'),
    ('text-gray-600', 'text-gray-600 dark:text-gray-400'),
    ('text-gray-500', 'text-gray-500 dark:text-gray-400'),
    ('text-gray-400', 'text-gray-400 dark:text-gray-500'),
    ('text-gray-300', 'text-gray-300 dark:text-gray-600'),
    
    # Borders
    ('border-gray-100', 'border-gray-100 dark:border-gray-700'),
    ('border-gray-200', 'border-gray-200 dark:border-gray-700'),
    ('border-gray-300', 'border-gray-300 dark:border-gray-600'),
    ('border-b bg-gray-50', 'border-b bg-gray-50 dark:bg-gray-800/50'),
    
    # Hover states
    ('hover:bg-gray-50', 'hover:bg-gray-50 dark:hover:bg-gray-700'),
    
    # Specific areas
    ('bg-gray-900 text-gray-400', 'bg-gray-900 dark:bg-gray-950 text-gray-400 dark:text-gray-500'),
    ('bg-gray-900', 'bg-gray-900 dark:bg-gray-950'),
    
    # Footer
    ('footer className="bg-gray-900', 'footer className="bg-gray-900 dark:bg-gray-950'),
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    for old, new in replacements:
        # Avoid double-replacing
        if 'dark:' in new and f'dark:{old.split(" ")[-1]}' in content:
            continue
        content = content.replace(old, new)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f'Updated: {filepath}')
    else:
        print(f'No changes: {filepath}')

print('\nDone!')