var ckeditorConfig = {
    extraPlugins: 'oxzion,abbr,imagepaste,sourcedialog,autocorrect,autolink,tableresize,lineheight,texttransform,quicktable,preview',
    height: 400,
    width: '100%',
    //IMPORTANT: Need this setting to retain HTML tags as we want them. Without this setting, 
    //CKEDITOR removes tags like span and flattens HTML structure.
    allowedContent: true,
    //extraAllowedContent:'span(*)',
    oxzion: {
        dimensions: {
            begin: {
                width: 300,
                height: 400
            },
            min: {
                width: 100,
                height: 100
            },
            max: {
                width: '100%',
                height: 600,
            }
        },
        dialogUrl: './widgetEditorDialog.html'
    }
};
ckeditorConfig.toolbarCanCollapse ='true';
ckeditorConfig.toolbarStartupExpanded = false;
ckeditorConfig.pasteFromWordRemoveFontStyles = false;
ckeditorConfig.pasteFromWordRemoveStyles = false;
ckeditorConfig.removeButtons = 'Underline,Subscript,Superscript,ShowBlocks,PageBreak,Save,NewPage,DocProps,Print,CreateDiv,Source';
ckeditorConfig.removePlugins = 'flash,iframe,ShowBlocks';
module.exports.ckeditorConfig = ckeditorConfig;