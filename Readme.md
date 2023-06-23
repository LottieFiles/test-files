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
* `example-meta.json`: (optional) Example metadata (more on this later)
* `example-XX.png`: (recommended) Reference render of the example, `XX` is the frame number.

The metadata file will have contents like these:

```js
{
    // Internal feature list, using path syntax
    "features": [
        "category/example/feature-1",
        "category/example/feature-2"
    ],
    // Features from canilottie
    "caniuse": [
        "category-example"
    ],
    // (optional) lottie-docs link
    "docs": "https://lottiefiles.github.io/lottie-docs/category/#example"
}
```

Everything is optional in the metadata file, if there are no features,
the contents are assumed to be

```js
"features": [
    "category/example"
]
```


Guidelines
----------

Please keep the features in a file to a minimum, and keep duration under 100 frames.

Whenever possible, do include an AEP file with the same contents as the lottie.

If the lottie doesn't have animations, only provide a single rendered frame,
if it does try to keep renders to a minimum and only provide necessary frames.

Keep the animation dimensions (width, height) to a minimum so it's easier
to compare renders.


Tools
-----

`./tools/report` will generate a JSON file reporting on the status of a directory containing renders to examine.

