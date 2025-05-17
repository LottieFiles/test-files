Lottie Feature Files
====================

This repository contains several files that can be used to validate Lottie
renderers and similar tools.


File Structure
--------------

All the files are in the `data/` subdirectory.
Here you find other directories that are used to group examples into categories.
Each category can contain multiple examples.

An example is composed of multiple files. Assuming the example
`category/example`, the following files could be found in `data/category`:

* `example.aep`: (optional) The Aftereffects project file corresponding to this example
* `example.json`: (required) The lottie to test
* `example.svg`: (optional) An equivalent SVG, it's important it should be rendered the same as the AE project
* `example-meta.json`: (required) Example metadata (more on this later)
* `example-XX.png`: (recommended) Reference render of the example, `XX` is the frame number.

The metadata file will have contents like these:

```js
{
    // Internal feature list, using path syntax
    "features": [
        "category/example/feature-1",
        "category/example/feature-2"
    ]
}
```

Everything is optional in the metadata file, if there are no features,
the contents are assumed to be

```js
"features": [
    "category/example"
]
```

If you need additional files for a test file, use `asset` in their file name, so they will be ignored by the tooling.
This also means that you cannot have the word `asset` appear in the test name.


Creating Test Files
-------------------

### Guidelines

Please keep the features in a file to a minimum, and keep duration under 100 frames.

Whenever possible, do include an AEP file with the same contents as the lottie.

If the lottie doesn't have animations, only provide a single rendered frame,
if it does try to keep renders to a minimum and only provide necessary frames.

Keep the animation dimensions (width, height) to a minimum so it's easier
to compare renders.


### AE script

To export everything needed for a test file you can install `./tools/Test File Export.jsx` in the After Effects
ScriptUI folder. Once installed, restart after effects and the you can toggle the panel from the _Window_ menu.

In order to export PNG, you need to update the AE _Lossless_ template to export as "PNG Sequence" "RGB + Alpha".

In the panel you can find a text box used to debug values, and the export button.
Clicking on _Export_ will save a bunch of files based on the ticked checkboxes.
If the project has not been saved, you'll be prompted to select the file, otherwise it will use the current project
file name.

By default it exports frame 0, to changed it update the relevant text box, you can also export multiple frames at once
by separating them with spaces or commas.

Similarly, you can list the features to add to the metadata file on the textbox that says "feature".

This script can also be used to generate missing files for an example.


### `add-file` script

This script will copy all the matching files in a directory, this is ueseful if you have a test file set up somewhere
and you want to import it. It will also generate a basic metadata file.

Note that this script expect a single test file in the given directory.


### Metadata

Ensure the file `(example)-meta.json` is valid and has the features listed.

You should also add feature-specific metadata in the features file (`./tools/features.json`).


### Verifying the new example

Always call `./tools/verify-examples` after adding some example, as this will highlight missing files and other problems.

Ideally also run a render and report to check the new test files work as intended.

Tools
-----

`./tools/features` Inspects and modifies feature metadata
`./tools/add-file` imports a test and generates its metadata
`./tools/verify-examples` shows a table with all the examples, you should invoke after adding new examples
`./tools/render` uses the given parameter to invoke scripts that render PNGs given a JSON
`./tools/report` generates a JSON file reporting on the status of a directory containing renders to examine
`./tools/render-report` shorthand script to call `render` and `report` with some sensible defaults

### Installation

You should set up a python virtual environment and install dependencies from the requirements file:

```bash
pip install ./tools/requirements.txt
```


### Render Sets

`./tools/render` generates a "render set", which contains the png files in the same structure as `./data/`.
Additionally, it creates a metadata file (`meta.json`) which is used by `./tools/report`.

The metadata file has the following structure:

```json
{
    "title": "Title of the report",
    "label": "Label for the columns in the report",
    "comment": "Optional comment",
    "command": "Command used to render the images",
    "skipped": ["list of skipped tests"],
    "format": "Input format",
    "times": {
        "reference-image-id": "time of the render in nanoseconds"
    }
}
```

You can genrate a report on a single render set or from multiple ones.
If you generate a report formn multiple render sets, you should ensure they have different labels.


### Generating a Report

Follows a practical example on how to generate a report with a given renderer
(here `glaxnimate` is used as a renderer for demonstation).

```bash
# Render images
tools/render -o /tmp/lottie-test/img glaxnimate {} -r {out} --frame {frame}
# Generate report data based on image accuracy
tools/report /tmp/lottie-test/img -o /tmp/lottie-test/report.json
# Generate HTML page for the report
tools/html-report /tmp/lottie-test/report.json -o /tmp/lottie-test/report.html
```

If you are OK with the default settings, you can also use the shorthand command `render-report`:

```bash
tools/render-report -o /tmp/lottie-test -f json glaxnimate {} -r {out} --frame {frame}
```

### Rendering with lottie-web

There's also an utility script that can render using lottie-web, it uses playwright
to render browser output.

First you need to install the dependencies:

```bash
pip install playwright
playwright install chromium
```

You can use it to generate a render set like so:

```bash
tools/render -o /tmp/lottie-test/img ./tools/lottie-web {} -o {out} --frame {frame} --browser chromium
```

### CI integration

You can force an error on an automated CI pipeline like this:

```bash
tools/error-report /tmp/lottie-test/report.json
```

It will print failed tests and exit with an error code if any tests aren't up to par.

You can ignore individual failures with `-i`.


License
-------

Everything in `./data/` is public domain (CC0), everything else is MIT (see `LICENSE`).
