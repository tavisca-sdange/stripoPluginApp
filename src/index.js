
import { EMAILUtility,MyObj } from './js/utility.js';
import { Configuration, EMAILConfiguration } from './js/configuration.js';
import { SETTING_ID, PREVIEW_CONTAINER_ID, HTTP_SUCCESS_CODE } from './js/constant.js';
import { usercontext } from './js/usercontext.js';
import uuidv4 from "./bundles/@bundled-es-modules/uuid/v4.js";
import{ExternalPreviewPopup} from "./external_preview_popup.js"
var isSaved = false;

var EMAILInitialization = {

    /*
    * This method will initialize stripo plugin template.
    * It call the callback method - initplugin once the html and css template is initialized.
    * multi_line - saving template html in multi_line field(content type property)
    */
    loadTemplate: function (callback) {
        getTemplateFromEntry().then(response => {
            let content = response.entry.full_html_content;
            if (content == "" || content === undefined) {
                const url = './components/blankstripostructure.html';
                request('GET', url, null, function (html) {
                    request('GET', Configuration.Stripo.DefaultTemplate.css, null, function (css) {
                        callback({ html: html, css: css });
                    });
                });
            }
            else {
                console.log('else')
                request('GET', Configuration.Stripo.DefaultTemplate.css, null, function (css) {
                callback({ html: content, css: css });
                });
            }
        });
    },

    /*
    * This method will initialize stripo plugin template.
    * The Auth plugin id and secret key can be read from config file but in future will shift that in api side.
    */
    initPlugin: function (template) {
        const apiRequestData = {
            emailId: uuidv4()
        };
        const script = document.createElement('script');
        script.id = 'stripoScript';
        script.type = 'text/javascript';
        script.src = Configuration.Stripo.StripoSource;
        script.onload = async function () {
            window.Stripo.init({
                mergeTags: MyObj,
                extensions: [

                    {

                        globalName: "CustomBlockExtension",

                        url: "http://localhost/TestApp2/importantInformationBlock.extension.js"

                    }

                ],

                "blockConfiguration": {

                    "enabled": `${(usercontext.contentTypeId !== usercontext.customblock.contenttypeuuid ? true : false)}`,

                    "groups": await loadContentBlocksGroup()

                },
                settingsId: 'stripoSettingsContainer',
                previewId: 'stripoPreviewContainer',
                codeEditorButtonId: 'codeEditor',
                "blockConfiguration": {
                    "enabled": `${(usercontext.contentTypeId !== usercontext.customblock.contenttypeuuid ? true : false)}`,
                    "groups": await loadContentBlocksGroup()
                },
                "mergeTags": [
                    {
                        "category": "Program",
                        "entries": [
                            {
                                "label": "Program Phone",
                                "value": "*|PPhone|*"
                            },
                            {
                                "label": "Program Name",
                                "value": "*|PName|*"
                            },
                            {
                                "label": "International Phone (if any)",
                                "value": "*|IPhone|*"
                            },
                            {
                                "label": "Trip ID",
                                "value": "*|TripID|*"
                            },
                            {
                                "label": "Dynamic hyperlinks : ClickAway link",
                                "value": "*|DHyperLink|*"
                            },
                            {
                                "label": "Terms and condition link (tclink as Merged tag)",
                                "value": "*|T&C|*"
                            }
                            , {
                                "label": "Mytrips link",
                                "value": "*|MyTripsLink|*"
                            }
                            , {
                                "label": "BillingAddress (AirCanada specific)",
                                "value": "*|BillingAddr|*"
                            }
                            , {
                                "label": "Invoice Number (AirCanada specific)",
                                "value": "*|InvNum|*"
                            }
                            , {
                                "label": "Take Our Survey (Button with a dynamic hyperlink)",
                                "value": "*|TakeSurvey|*"
                            }
                        ]
                    }
                ],
                locale: Configuration.Stripo.StripoLocalization,
                html: template.html,
                css: template.css,
                ignoreClickOutsideSelectors: '#externalFileLibrary',
                apiRequestData: apiRequestData,
                getAuthToken: function (callback) {
                    request('POST', Configuration.Stripo.StipoAuthUrl,
                        JSON.stringify({
                            pluginId: usercontext.pluginId,
                            secretKey: usercontext.secretKey
                        }),
                        function (data) {
                            callback(JSON.parse(data).token);
                        });
                }
            });
        };
        document.body.appendChild(script);
    }
};

/*
* This method will return html entry response to load plugin.
*/
async function getTemplateFromEntry() {
    var url = `${Configuration.ContentStack.baseUrl}` + 'content_types/' + `${usercontext.contentTypeId}` + '/entries/' + `${usercontext.entryId}`;
    var headers = EMAILUtility.getContentStackRequestHeader();
    return await EMAILUtility.createFetchRequest(url, headers, "GET");
}

/*
* This method will save modified template to content stack
*/
async function saveTemplateToContentStack(htmltext) {

    var response = retrieveContentBlockContentFromHTML(htmltext);

    var data = {
        "entry": {
            "custom": "",
            "multi_line": response,
            "full_html_content": htmltext,
            "tags": [],
            //TODO Need to pass locale from stripo
            "locale": "en-us"
        }
    };

    var url = `${Configuration.ContentStack.baseUrl}` + 'content_types/' + `${usercontext.contentTypeId}` + '/entries/' + `${usercontext.entryId}`;
    var headers = EMAILUtility.getContentStackRequestHeader();

    var successCode = await EMAILUtility.createFetchRequest(url, headers, "PUT", data);

    if (successCode !== HTTP_SUCCESS_CODE) {
        //EMAILUtility.showSuccessErrorMessage("Error!! Changes done to the template have not been saved. Please retry.", "red");
        throw new Error("Some exception occured");
    }

    //EMAILUtility.showSuccessErrorMessage("Template has been saved successfully.", "lightgreen");

    alert("Template has been saved successfully");
}

var retrieveContentBlockContentFromHTML = function (html) {

    if (usercontext.contentTypeId === usercontext.customblock.contenttypeuuid) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var contentBlockContent = doc.querySelector('td.esd-stripe');
        if (contentBlockContent === undefined) {
            var contentBlockElement = doc.querySelector('td.esd-structure');
            return contentBlockElement.innerHTML;
        }

        return contentBlockContent.innerHTML;
    }

    return html;


}

var request = function (method, url, data, callback) {
    EMAILUtility.createXMLHttpRequest(method, url, data, callback);
};

var loadContentBlocksGroup = async function () {
    var url = `${Configuration.ContentStack.baseUrl}` + 'content_types/' + `${usercontext.customblock.contenttypeuuid}` + '/entries';
    var headers = EMAILUtility.getContentStackRequestHeader();

    var response = await EMAILUtility.createFetchRequest(url, headers, "GET");

    if (response != undefined) {
        var contentBlockGroupList = [];

        response.entries.forEach(element => {
            var group = {

                "id": element.uid,
                "name": element.name,
                "placeholder": element.placeholdertext,
                "contenttype": usercontext.customblock.contenttypeuuid
            }

            contentBlockGroupList.push(group);
        });

        return contentBlockGroupList;
    }

    return [];
}

document.querySelector("#saveButton").addEventListener('click', function (data) {
    window.StripoApi.getTemplate(function (html, css) {
        saveTemplateToContentStack(html)
        isSaved = true;
    })
});
async function creplace(html)
{
    var EntryUID= "";
    var ContenttypeUID="";
    var StringHTML = html;
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    var customBlockNodeList = doc.querySelectorAll('custom-block');
    if (customBlockNodeList.length == 0) {
        ExternalPreviewPopup.openPreviewPopup(StringHTML);
    }
    for (var i = 0; i < customBlockNodeList.length; i++) {
        var element = customBlockNodeList[i];
        var outerhtml = element.outerHTML;
        EntryUID = element.getAttribute('selectedblocktypeuid');
        ContenttypeUID = element.getAttribute('selectedcontenttype');
        var headers = EMAILUtility.getContentStackRequestHeader();
        var url = `${Configuration.ContentStack.baseUrl}` + 'content_types/' + ContenttypeUID + '/entries/'+EntryUID;
        var successCode = await EMAILUtility.httpFetch(url, headers, "GET")
        StringHTML = StringHTML.replace(outerhtml, successCode.entry.multi_line);
    }
    ExternalPreviewPopup.openPreviewPopup(StringHTML);
   // return StringHTML;
}
document.querySelector('#previewButton').addEventListener('click', function() {
    window.StripoApi.compileEmail (function (error, html) {
        var doc = creplace(html);
        
    });
});

window.addEventListener("beforeunload", function (e) {
    if (!isSaved) {
        var dialogText = 'There are some unsaved changes , Do you want to leave the site';
        e.returnValue = dialogText;
        return dialogText;
    }
});
window.addEventListener("keydown", event => {
    if (event.isComposing || event.keyCode === 27) {
        externalPreviewPopup.style.visibility = 'hidden';
    }
    // do something
  });
export { EMAILInitialization}
