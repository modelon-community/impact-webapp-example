#!/bin/bash

# Get the directory of the script
script_dir=$PWD
project_dir=$(dirname "$(pwd)")
script_dir_name=$(basename "$(pwd)")
impact_customizations_dir="$IMPACT_BASEDIR/customizations"

# Define paths
source_dir="$project_dir/Resources/CustomWebApps/$script_dir_name"
target_dir="$impact_customizations_dir/$script_dir_name"

# Copy /dist into customizations/$current_dir_name
rm -rf "$target_dir"
cp -rf "$source_dir" "$target_dir"

echo "Deployed $source_dir to $target_dir"
