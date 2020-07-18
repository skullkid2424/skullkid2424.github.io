#!/usr/bin/env python

# Fetch all hero face portraits from the wiki
# Recreate the HTML dropdown options

import urllib.request
import string
import os

# Fetch (new) image
def get_image(url, name):
  path = "assets/heroes/" + name
  if not os.path.isfile(path):
    urllib.request.urlretrieve(url, path)

# Recursive function to grab all face URLs, download images, and recurse to the next page
def search_page(site):
  page = urllib.request.urlopen(site)

  output = []

  found = 0
  next_page = ''

  for line in page:
    line = str(line)
    # Skip ahead till we find the top navigation area
    if line.find("next page") >= 0:
      found = 1
      start = line.find("/index", line.index("previous page"), -1)
      end = line.index("next page") - 39
      if start == -1:
        # Case when on the last page:
        # Next Page "link" was found, but with no URL
        next_page = ""
      else:
        # Generate the link to the next page in the list
        next_page = f"https://feheroes.gamepedia.com{line[start:end]}".replace('&amp;', '&')

    if found == 1:
      # Seach the line for URL for the image
      if line.strip().find('<div class="thumb" style="width: 150px;">') >= 0:
        start = line.index('srcset="https')
        face_url = line.strip()[start+8:-28]

        # Generate filename
        name_start = line.find('img alt=') + 9
        name_end = line[name_start:].find('FC.webp') - 6
        name = line[name_start:name_start + name_end].lower().replace(' ', '_') + ".png"

        get_image(face_url, name)

        # Generate HTML option tags
        words = name.split('_')
        html_name = words[0] + ": " + " ".join(words[1:])
        html_name = string.capwords(html_name[:-4])
        #print(f'            <option value = "assets/heroes/{name}">{html_name}</option>')
        output.append(f'            <option value = "assets/heroes/{name}">{html_name}</option>')


  # Recurse
  if next_page:
    output = output + search_page(next_page)

  return output

# Splice the dropdown options into the html
def update_index_html(options):
  original = open("index.html", 'r')
  output = open("temp.html", 'w')

  write_lines = True

  for line in original:
    # Check for end tag and start writing again
    if not write_lines:
      if line.find("HEROES END HERE") >= 0:
        write_lines = True

    if write_lines:
      output.write(line)

    # Check for start tag
    # Stop writing lines until we get to the end tag
    if line.find("HEROES START HERE") >= 0:
      write_lines = False

      for option in options:
        output.write(option + "\n")

  original.close()
  output.close()

  os.rename("index.html", "index.html.old")
  os.rename("temp.html", "index.html")




# Main

site = "https://feheroes.gamepedia.com/index.php?title=Category:Icon_Portrait_files"

options = search_page(site)
update_index_html(options)
