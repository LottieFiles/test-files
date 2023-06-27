/*
    Script to simplify the export workflow
    Install in C:/Program Files/Adove/Adobe After Effects (version)/Support Files/Scripts/ScriptUI Panels/

    Make sure the "lossless" preset exports as "RGB + Alpha" "PNG Sequence" before using.

    Scripting Docs:

    https://extendscript.docsforadobe.dev/user-interface-tools/types-of-controls.html
    https://ae-scripting.docsforadobe.dev/
*/

(function(panel){

function stringify(val, indent)
{
    if ( val === null )
        return "null";
    if ( val === true )
        return "true";
    if ( val === false )
        return "false";
    if ( typeof val == "number" )
        return val.toString()
    if ( typeof val == "string" )
        return '"' + val.replace("\\", "\\\\").replace("\n", "\\n").replace("\"", "\\\"") + '"';

    if ( indent === undefined )
        indent = "";

    if ( val instanceof Array )
    {
        if ( val.length == 0 )
            return "[]";

        out = "[\n";
        for ( var i = 0; i < val.length; i++ )
            out += indent + stringify(val[i], indent + "    ") + ",\n";
        out += indent + "]\n";
        return out;
    }

    out = "{\n";
    for ( var k in val )
        out += indent + stringify(k) + ": " + stringify(val[k], indent + "    ") + ",\n";
    out += indent + "}\n";
    return out;
}

var len = 300;
var text_input = panel.add("edittext", [10, 10, len, 30], "");
var btn_test = panel.add("button", [len + 10, 10, len + 100, 30], "Test Value");
var btn_export = panel.add("button", [10, 40, 100, 60], "Export");
var text_output = panel.add("statictext", [10, 70, 500, 100], "");

btn_test.onClick = function()
{
    text_output.text = "Error!";

    try {
        text_output.text = eval(text_input.text);
    } catch ( e ) {
        text_output.text = e.toString();
    }
};


btn_export.onClick = function()
{
    text_output.text = "Exporting...";
    try {
        if ( !app.project )
        {
            text_output.text = "Open a project first!";
            return;
        }

        var has_file_perms = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
        if ( has_file_perms != 1 )
        {
            text_output.text = "Go to Edit > Preferences > Scripting & Expressions > select Allow Scripts to Write Files and Access Network\n";
            return;
        }

        if ( !app.project.activeItem || app.project.activeItem.constructor.name != "CompItem" )
        {
            text_output.text = "No active comp";
            return;
        }

        text_output.text = "Saving project";
        app.project.save();

        text_output.text = "Exporting Lottie";
        var lottie_name = app.project.file.fullName.replace(".aep", ".json");
        var default_settings = {
            themeColor: '',
            description: '',
            keywords: '',
            author: '',
            demo: false,
            fonts: [],
            generatorVersion: $.__bodymovin.bm_versionHelper.get(),
            segmented: false,
            segmentedTime: 10,
            standalone: false,
            avd: false,
            glyphs: true,
            bundleFonts: false,
            inlineFonts: false,
            hiddens: false,
            original_assets: false,
            original_names: false,
            should_encode_images: true,
            should_compress: true,
            should_skip_images: false,
            should_include_av_assets: false,
            compression_rate: 80,
            extraComps: {
                active: false,
                list: [],
            },
            guideds: false,
            ignore_expression_properties: false,
            export_old_format: false,
            skip_default_properties: false,
            not_supported_properties: false,
            pretty_print: false,
            export_mode: "standard",
            export_modes: {
                standard: true,
                demo: false,
                standalone: false,
                banner: false,
                avd: false,
                rive: false,
                reports: false,
            },
            demoData: {
                backgroundColor: '#fff',
            },
            banner: {
                lottie_origin: "local",
                lottie_path: 'https://',
                lottie_library: $.__bodymovin.bm_versionHelper.get(),
                lottie_renderer: 'svg',
                width: 500,
                height: 500,
                use_original_sizes: true,
                original_width: 500,
                original_height: 500,
                click_tag: 'https://',
                zip_files: true,
                shouldIncludeAnimationDataInTemplate: false,
                shouldLoop: false,
                loopCount: 0,
                localPath: null,
            },
            expressions: {
                shouldBake: false,
                shouldCacheExport: false,
                shouldBakeBeyondWorkArea: false,
                sampleSize: 1,
            },
            audio: {
                isEnabled: true,
                bitrate: '16kbps',
            },
            essentialProperties: {
                active: false,
                useSlots: false,
                skipExternalComp: true,
            },
        };
        var lottie_comp = {
            id: app.project.activeItem.id,
            absoluteURI: lottie_name,
            destination: lottie_name,
            settings: default_settings,
            uid: app.project.activeItem.id,
        };

        $.__bodymovin.bm_compsManager.renderComposition(lottie_comp);

        text_output.text = "Rendering Frame";
        item = app.project.renderQueue.items.add(app.project.activeItem);
        item.timeSpanDuration = app.project.activeItem.frameDuration;
        item.timeSpanStart = 0;
        item.outputModule(1).applyTemplate("Lossless");
        item.outputModule(1).file = new File([app.project.file.fullName.replace(".aep", "-[##].png")]);
        item.render = true;
        app.project.renderQueue.render();

        text_output.text = "All done!\n";
    } catch ( e ) {
        text_output.text = e.toString();
    }

};

})(this);

