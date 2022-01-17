import { usercontext } from './js/usercontext.js';
var externalPreviewPopup;
//window.ExternalPreviewPopup = (function() {
    var ExternalPreviewPopup ={
    
     close :function() {

        console.log(usercontext.TemplateName);
        externalPreviewPopup.style.visibility = 'hidden';
    },

     initPreviewPopup : function() {
        var div = document.createElement('div');
        div.innerHTML = '\
            <div id="externalPreviewPopup">\
                <div class="modal-container">\
                    <div class="modal-header-container">\
                        <div>\
                           <button type="button" class="close modal-close-button">\
                                <span>× esc</span>\
                            </button>\
                            <h4 class="modal-title">'+usercontext.TemplateName+'</h4>\
                        </div>\
                    </div>\
                    <div id="content"  class="preview-container-fluid">\
                       <div class="preview-row">\
                            <div class="preview-col-sm-8">\
                                <div class="esdev-desktop-device">\
                                    <div class="esdev-email-window-panel">\
                                        <div class="esdev-email-subject" style="min-height: 20px"></div>\
                                    </div>\
                                    <div class="esdev-desktop-device-screen">\
                                        <iframe id="iframeDesktop" frameborder="0" ></iframe>\
                                    </div>\
                                </div>\
                            </div>\
                            <div class="preview-col-sm-4 esdev-no-padding-left">\
                                <div class="esdev-mobile-device center-block">\
                                    <div class="esdev-mobile-device-screen">\
                                        <img src="mobile-view-top-bar.png" alt="">\
                                        <iframe id="iframeMobile" frameborder="0" width="100%" height="75%"></iframe>\
                                        <img class="esdev-mail-bottom-bar" src="mobile-view-bottom-bar.png" alt="">\
                                    </div>\
                                </div>\
                            </div>\
                       </div>\
                    </div>\
                </div>\
            </div>';
        document.body.appendChild(div);

        externalPreviewPopup = document.getElementById('externalPreviewPopup');
        externalPreviewPopup.querySelector('.close').addEventListener('click', this.close);
    },

     openPreviewPopup : function(html) {
        if (!externalPreviewPopup) {
           this.initPreviewPopup();
        }
        this.updateContent(html);
        externalPreviewPopup.style.visibility = 'visible';
    },

     updateContent : function(html) {
        var iframeDesktop = document.querySelector('#iframeDesktop');
        iframeDesktop.contentWindow.document.open('text/html', 'replace');
        iframeDesktop.contentWindow.document.write(html);
        iframeDesktop.contentWindow.document.close();

        var iframeMobile = document.querySelector('#iframeMobile');
        iframeMobile.contentWindow.document.open('text/html', 'replace');
        iframeMobile.contentWindow.document.write(html);
        iframeMobile.contentWindow.document.close();
    },

    // return {
    //     openPreviewPopup: openPreviewPopup
    // };
    }
export{ExternalPreviewPopup}