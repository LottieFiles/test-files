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

    var sub_indent = indent + "    ";

    if ( val instanceof Array )
    {
        if ( val.length == 0 )
            return "[]";

        out = "[\n";
        for ( var i = 0; i < val.length; i++ )
        {
            out += sub_indent + stringify(val[i], sub_indent);
            if ( i < val.length - 1 )
                out += ",";
            out += "\n";
        }
        out += indent + "]";
        return out;
    }

    out = "{\n";
    for ( var k in val )
        out += sub_indent + stringify(k) + ": " + stringify(val[k], sub_indent) + ",\n";
    if ( out[out.length-2] == "," )
        out = out.substr(0, out.length-2) + "\n";
    out += indent + "}";
    return out;
}

function bodymovin_export(comp, file_name, smil)
{
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
        includeExtraChars: false,
        bundleFonts: false,
        inlineFonts: false,
        hiddens: false,
        original_assets: false,
        original_names: false,
        should_encode_images: true,
        should_compress: true,
        should_skip_images: false,
        should_reuse_images: true,
        should_include_av_assets: false,
        compression_rate: 80,
        extraComps: {
            active: false,
            list: [],
        },
        guideds: false,
        ignore_expression_properties: false,
        export_old_format: false,
        use_source_names: false,
        shouldTrimData: false,
        skip_default_properties: false,
        not_supported_properties: false,
        // Changed from the default
        pretty_print: true,
        useCompNamesAsIds: false,
        export_mode: "standard",
        export_modes: {
            standard: true,
            demo: false,
            standalone: false,
            banner: false,
            avd: false,
            // Changed from the default
            smil: smil,
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
            shouldRaterizeWaveform: true,
            bitrate: '16kbps',
        },
        essentialProperties: {
            active: false,
            useSlots: false,
            skipExternalComp: true,
        },
    };

    var lottie_comp = {
        id: comp.id,
        absoluteURI: file_name,
        destination: file_name,
        settings: default_settings,
        uid: comp.id,
    };

    $.__bodymovin.bm_compsManager.renderComposition(lottie_comp);
}

function cleanup_smil()
{
    var basename = app.project.file.name.replace(".aep", "");
    var src_smil = new File(app.project.file.parent.fullName + "/smil/" + basename + ".svg");
    var dest_smil = new File(app.project.file.parent.fullName + "/" + basename + ".svg");
    src_smil.copy(dest_smil);

    src_smil.remove();
    src_smil.parent.remove();
}

function make_group(parent)
{
    var grp = parent.add("group", undefined, "");
    grp.orientation = "row";
    grp.alignChildren = ["left", "top"];
    grp.spacing = 10;
    return grp;
}

panel.orientation = "column";
panel.alignChildren = ["fill", "top"];
panel.margins = 10;

var row = make_group(panel);
var text_input = row.add("edittext", undefined, "");
text_input.alignment = ["fill", "fill"];
var btn_test = row.add("button", undefined, "Test Value");
btn_test.alignment = ["right", "top"];
btn_test.preferredSize.width = 100;

var opts = make_group(panel);
var btn_export = opts.add("button", undefined, "Export");
var cb_aep = opts.add("checkbox", undefined, "aep");
var cb_json = opts.add("checkbox", undefined, "json");
var cb_svg = opts.add("checkbox", undefined, "svg");
var cb_pag = opts.add("checkbox", undefined, "pag");
var cb_meta = opts.add("checkbox", undefined, "meta");
var cb_png = opts.add("checkbox", undefined, "png");
cb_aep.value = cb_json.value = cb_svg.value = cb_png.value = cb_meta.value = true;
cb_pag.value = false;
var input_frames = opts.add("edittext", undefined, "0");
input_frames.alignment = ["fill", "fill"];


var input_feature = panel.add("edittext", undefined, "feature");
input_feature.alignment = ["fill", "top"];

var text_output = panel.add("statictext", undefined, "", {multiline: true, scrolling: true});
text_output.alignment = ["fill", "fill"];

panel.minimumSize.width = 100;
panel.minimumSize.height = 600;
panel.preferredSize.height = 600;
panel.size.height = 600;
panel.onResizing = panel.onResize = function(e) {
    this.layout.resize();
}
panel.layout.layout(true);
panel.layout.resize();


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

        if ( cb_aep.value || !app.project.file )
        {
            text_output.text = "Saving project";
            app.project.save();
        }

        if ( cb_json.value || cb_svg.value )
        {
            if ( $.__bodymovin === undefined )
            {
                text_output.text = "Bodymovin not loaded";
                return;
            }

            text_output.text = "Exporting Lottie";
            var lottie_name = app.project.file.fullName.replace(".aep", ".json");

            if ( cb_svg.value )
            {
                var old_send_event = $.__bodymovin.bm_eventDispatcher.sendEvent;
                $.__bodymovin.bm_eventDispatcher.sendEvent = function(type, data)
                {
                    old_send_event(type, data);
                    if ( type == 'bm:render:update' && data.isFinished )
                    {
                        $.__bodymovin.bm_eventDispatcher.sendEvent = old_send_event;
                        cleanup_smil();
                    }
                };
                $.__bodymovin.bm_eventDispatcher.sendEvent.old = old_send_event;
            }

            bodymovin_export(app.project.activeItem, lottie_name, cb_svg.value);
        }

        if ( cb_meta.value )
        {
            var meta_data = {
                "features": input_feature.text.split(/[,;\s]+/)
            };

            var file = new File([app.project.file.fullName.replace(".aep", "-meta.json")]);
            file.open("w");
            file.write(stringify(meta_data));
            file.close();
        }

        if ( cb_png.value )
        {
            var frame_length = app.project.activeItem.frameDuration;
            var frames = input_frames.text.split(/[,;\s]+/);
            if ( frames.length == 0 )
                frames = [0];

            for ( var i = 0; i < frames.length; i++ )
            {
                var frame = Number(frames[i]);
                text_output.text = "Queueing Frame " + frame;
                item = app.project.renderQueue.items.add(app.project.activeItem);
                item.timeSpanDuration = frame_length;
                item.timeSpanStart = frame * frame_length;
                item.outputModule(1).applyTemplate("Lossless");
                item.outputModule(1).file = new File([app.project.file.fullName.replace(".aep", "-[##].png")]);
                item.render = true;
                // Rendering every one by itself because AE is a pain with file names for PNG sequences...
                app.project.renderQueue.render();
            }
        }

        // Bit slow so disabled by default
        if ( cb_pag.value )
        {
            text_output.text = "Exporting PAG";
            app.executeCommand(5006);
        }

        text_output.text = "All done!\n";
    } catch ( e ) {
        text_output.text += "\n" + e.toString();
    }

};

})(this);
