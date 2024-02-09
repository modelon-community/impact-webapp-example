#!/bin/bash

# Get the directory of the script
script_dir=$PWD
script_dir_name=$(basename "$(pwd)")
impact_customizations_dir="$IMPACT_BASEDIR/customizations"

# Define paths
source_dir="$script_dir/dist"
target_dir="$impact_customizations_dir/$script_dir_name"

# Create symbolic link
# TODO: Impact does not pick up "linked" apps - copying instead for now
# ln -s "$source_dir" "$target_dir"

# Copy /dist into customizations/$current_dir_name
rm -rf "$target_dir"
cp -rf "$source_dir" "$target_dir"

echo "Deployed $source_dir to $target_dir"
