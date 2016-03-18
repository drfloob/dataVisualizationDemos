# modified from http://stackoverflow.com/a/19706994/10161

import csv
import json
import sys
import os

if len(sys.argv) == 1:
    print("missing filename. Usage: csvToPython.py <filename.csv>")
    exit(1)
    
if len(sys.argv) > 2:
    print("Too many arguments. Usage: csvToPython.py <filename.csv>")
    exit(2)

inFile = sys.argv[1]
outFile = os.path.splitext(inFile)[0] + '.json'
    
csvfile = open(inFile, 'r')
jsonfile = open(outFile, 'w')

fieldnames = ("FirstName","LastName","IDNumber","Message")
reader = csv.DictReader(csvfile)
jsonfile.write("[\n");
for row in reader:
    json.dump(row, jsonfile)
    jsonfile.write(',\n')
jsonfile.write("null]");
