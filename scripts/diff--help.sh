#!/bin/bash

openscad-nightly --help > openscad--help_current.txt 2>&1
openscad-nightly --help-export > openscad--help-export_current.txt 2>&1

diff openscad--help.txt openscad--help_current.txt
diff openscad--help-export.txt openscad--help-export_current.txt
rm openscad--help_current.txt openscad--help-export_current.txt
