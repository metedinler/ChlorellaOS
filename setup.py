"""
ChlorellaOS Setup Script
© 2025 Mete Dinler. All rights reserved.

This is a commercial system requiring a valid license.
Unauthorized use is prohibited.
"""

from setuptools import setup, find_packages
import os

# Read README
with open('README.md', 'r', encoding='utf-8') as f:
    long_description = f.read()

setup(
    name='ChlorellaOS',
    version='1.0.0',
    author='Zuhtu Mete Dinler',
    author_email='contact@chlorellaos.com',
    description='Chlorella Vulgaris Endüstriyel Üretim ve İmmobilizasyon Prosesi İzleme Sistemi',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/metedinler/ChlorellaOS',
    packages=find_packages(),
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Intended Audience :: Manufacturing',
        'Topic :: Scientific/Engineering :: Bio-Informatics',
        'License :: Other/Proprietary License',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.8',
    install_requires=[
        # Core dependencies - minimal for basic functionality
    ],
    extras_require={
        'dev': [
            'pytest>=7.0.0',
            'pytest-cov>=3.0.0',
        ],
        'full': [
            'numpy>=1.21.0',
            'pandas>=1.3.0',
            'scipy>=1.7.0',
            'matplotlib>=3.4.0',
            'openpyxl>=3.0.0',
        ]
    },
    entry_points={
        'console_scripts': [
            'chlorellaos=chlorellaos.__main__:main',
        ],
    },
    include_package_data=True,
    package_data={
        'chlorellaos': ['config/*.py'],
    },
    license='Proprietary',
    keywords='chlorella vulgaris production monitoring algae biotechnology',
    project_urls={
        'Source': 'https://github.com/metedinler/ChlorellaOS',
        'Documentation': 'https://github.com/metedinler/ChlorellaOS/tree/main/docs',
    },
)

print("\n" + "="*70)
print("ChlorellaOS v1.0.0")
print("© 2025 Mete Dinler. All rights reserved.")
print("="*70)
print("\nIMPORTANT NOTICE:")
print("This is a COMMERCIAL system requiring a valid license.")
print("USAGE WITHOUT PAYMENT IS PROHIBITED.")
print("All rights reserved by ZUHTU METE DINLER.")
print("\nFor licensing information, please contact the author.")
print("="*70 + "\n")
