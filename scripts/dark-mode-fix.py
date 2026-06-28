import re, glob

# Fix specific patterns the first pass missed
files = (
    glob.glob('/home/z/my-project/src/components/customer/*.tsx') +
    glob.glob('/home/z/my-project/src/components/admin/*.tsx') +
    ['/home/z/my-project/src/app/page.tsx']
)

skip = ['Header.tsx']
files = [f for f in files if not any(s in f for s in skip)]

replacements = [
    # className="bg-gray-50" (standalone, no space before)
    ('"bg-gray-50 ', '"bg-gray-50 dark:bg-[#111827] '),
    # bg-white without dark (some might have been missed)
    ('bg-white shadow-sm', 'bg-white dark:bg-gray-800 shadow-sm'),
    # The hero banner's white/10 should be fine, but features strip
    ('bg-white border-b', 'bg-white dark:bg-gray-800 border-b dark:border-gray-700'),
    # hover:shadow-md patterns
    ('hover:shadow-md', 'hover:shadow-lg dark:hover:shadow-gray-900/40'),
    # Specific: placeholder colors in inputs
    ('placeholder:text-gray-400"', 'placeholder:text-gray-400 dark:placeholder:text-gray-500"'),
    # Green-100 backgrounds  
    ('bg-green-100', 'bg-green-100 dark:bg-green-900/30'),
    # Blue-100 backgrounds
    ('bg-blue-50', 'bg-blue-50 dark:bg-blue-900/20'),
    ('bg-blue-100', 'bg-blue-100 dark:bg-blue-900/30'),
    # Purple-100 backgrounds
    ('bg-purple-50', 'bg-purple-50 dark:bg-purple-900/20'),
    ('bg-purple-100', 'bg-purple-100 dark:bg-purple-900/30'),
    # Gray-900 text already handled, check for any remaining "text-black"
    ('text-black', 'text-gray-900 dark:text-gray-100'),
    # Remaining "border" without color
    ('border-t border-gray-800', 'border-t border-gray-800 dark:border-gray-700'),
    # The green-50 in features strip
    ('border-green-100', 'border-green-100 dark:border-green-800'),
    # Skeleton dark mode
    ('bg-white/20', 'bg-white/20 dark:bg-white/10'),
    # Select/combobox
    ('bg-popover', ''),
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f'Fixed: {filepath}')

print('\nDone!')