import { NetworkEventData } from "@requestly/web-sdk";

const mockNetworkEvents: NetworkEventData[] = [
  {
    timestamp: 1653654847397,
    method: "GET",
    url: "https://github.com/users/lazyvab/feature_preview/indicator_check",
    requestData: '{"key":123}',
    response: '{"show_indicator":true}',
    status: 200,
    responseTime: 404,
  },
  {
    timestamp: 1653654847970,
    method: "POST",
    url: "https://server.example.com/fetch",
    requestData: {
      pageUri: "/",
      pageContext: {
        paginatedFetch: true,
        pageNumber: 2,
        fetchAllPages: false,
        paginationContextMap: {
          dj: {
            context: {
              collectionMetaInfoList: [],
              paginationCursor: {
                cursorType: "djCursor",
                contentProvidersCursorMap: {
                  NEO_ADS: {
                    collectionMetaInfoList: [],
                    paginationCursor: {
                      cursorType: "contentProviderCursor",
                      cacheKey: null,
                      hasMoreContent: true,
                      offset: 0,
                    },
                  },
                  FACT_BASED_RECOMMENDATION: {
                    collectionMetaInfoList: [],
                    paginationCursor: {
                      cursorType: "contentProviderCursor",
                      cacheKey: null,
                      hasMoreContent: true,
                      offset: 0,
                    },
                  },
                  NEO: {
                    collectionMetaInfoList: [],
                    paginationCursor: {
                      cursorType: "contentProviderCursor",
                      cacheKey: null,
                      hasMoreContent: true,
                      offset: 0,
                    },
                  },
                  PERSONALISEDRECOMMENDATION: {
                    collectionMetaInfoList: [],
                    paginationCursor: {
                      cursorType: "contentProviderCursor",
                      hasMoreContent: true,
                      offset: 0,
                    },
                  },
                },
                foldId: 1,
                foldSize: 55,
                hasMoreContent: true,
                lastFold: false,
                offset: 6,
                paginatedContentProviders: null,
                rankedQueueSize: 7,
                servedFoldNumber: 1,
                servedWidgetCount: 6,
              },
            },
            pageType: "HOMEPAGE",
          },
        },
      },
    },
    response: '{"userId":1,"id":1,"title":"Apple is an American technology company.","completed":false}',
    status: 200,
    responseTime: 328,
    contentType: "application/json;charset=utf-8",
  },
  {
    timestamp: 1653654848375,
    method: undefined,
    url: "",
    responseURL:
      "https://github.com/requestly/requestly-demo/spoofed_commit_check/4ed9548459d91bc6e5acd4837938cae2918dd6b9",
    requestData: {},
    response: "\n\n",
    status: 200,
    responseTime: 334,
  },
  {
    timestamp: 1653654848994,
    method: "PATCH",
    url: "https://github.com/requestly/requestly-demo/issues/100000/labels",
    requestData:
      '------WebKitFormBoundaryLCVNm5cBJB1Ps1CX\r\nContent-Disposition: form-data; name="_method"\r\n\r\npatch\r\n------WebKitFormBoundaryLCVNm5cBJB1Ps1CX\r\nContent-Disposition: form-data; name="issue[labels][]"\r\n\r\n\r\n------WebKitFormBoundaryLCVNm5cBJB1Ps1CX\r\nContent-Disposition: form-data; name="issue[labels][]"\r\n\r\n2937004376\r\n------WebKitFormBoundaryLCVNm5cBJB1Ps1CX--\r\n',
    response:
      '<div class="discussion-sidebar-item js-discussion-sidebar-item">\n  \n\n\n  <details class="details-reset details-overlay select-menu hx_rsm label-select-menu"\n    id="labels-select-menu">\n\n    <summary class="text-bold discussion-sidebar-heading discussion-sidebar-toggle hx_rsm-trigger"\n             aria-haspopup="menu"\n             data-hotkey="l"\n             data-menu-trigger="labels-select-menu">\n      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-gear">\n    <path fill-rule="evenodd" d="M7.429 1.525a6.593 6.593 0 011.142 0c.036.003.108.036.137.146l.289 1.105c.147.56.55.967.997 1.189.174.086.341.183.501.29.417.278.97.423 1.53.27l1.102-.303c.11-.03.175.016.195.046.219.31.41.641.573.989.014.031.022.11-.059.19l-.815.806c-.411.406-.562.957-.53 1.456a4.588 4.588 0 010 .582c-.032.499.119 1.05.53 1.456l.815.806c.08.08.073.159.059.19a6.494 6.494 0 01-.573.99c-.02.029-.086.074-.195.045l-1.103-.303c-.559-.153-1.112-.008-1.529.27-.16.107-.327.204-.5.29-.449.222-.851.628-.998 1.189l-.289 1.105c-.029.11-.101.143-.137.146a6.613 6.613 0 01-1.142 0c-.036-.003-.108-.037-.137-.146l-.289-1.105c-.147-.56-.55-.967-.997-1.189a4.502 4.502 0 01-.501-.29c-.417-.278-.97-.423-1.53-.27l-1.102.303c-.11.03-.175-.016-.195-.046a6.492 6.492 0 01-.573-.989c-.014-.031-.022-.11.059-.19l.815-.806c.411-.406.562-.957.53-1.456a4.587 4.587 0 010-.582c.032-.499-.119-1.05-.53-1.456l-.815-.806c-.08-.08-.073-.159-.059-.19a6.44 6.44 0 01.573-.99c.02-.029.086-.075.195-.045l1.103.303c.559.153 1.112.008 1.529-.27.16-.107.327-.204.5-.29.449-.222.851-.628.998-1.189l.289-1.105c.029-.11.101-.143.137-.146zM8 0c-.236 0-.47.01-.701.03-.743.065-1.29.615-1.458 1.261l-.29 1.106c-.017.066-.078.158-.211.224a5.994 5.994 0 00-.668.386c-.123.082-.233.09-.3.071L3.27 2.776c-.644-.177-1.392.02-1.82.63a7.977 7.977 0 00-.704 1.217c-.315.675-.111 1.422.363 1.891l.815.806c.05.048.098.147.088.294a6.084 6.084 0 000 .772c.01.147-.038.246-.088.294l-.815.806c-.474.469-.678 1.216-.363 1.891.2.428.436.835.704 1.218.428.609 1.176.806 1.82.63l1.103-.303c.066-.019.176-.011.299.071.213.143.436.272.668.386.133.066.194.158.212.224l.289 1.106c.169.646.715 1.196 1.458 1.26a8.094 8.094 0 001.402 0c.743-.064 1.29-.614 1.458-1.26l.29-1.106c.017-.066.078-.158.211-.224a5.98 5.98 0 00.668-.386c.123-.082.233-.09.3-.071l1.102.302c.644.177 1.392-.02 1.82-.63.268-.382.505-.789.704-1.217.315-.675.111-1.422-.364-1.891l-.814-.806c-.05-.048-.098-.147-.088-.294a6.1 6.1 0 000-.772c-.01-.147.039-.246.088-.294l.814-.806c.475-.469.679-1.216.364-1.891a7.992 7.992 0 00-.704-1.218c-.428-.609-1.176-.806-1.82-.63l-1.103.303c-.066.019-.176.011-.299-.071a5.991 5.991 0 00-.668-.386c-.133-.066-.194-.158-.212-.224L10.16 1.29C9.99.645 9.444.095 8.701.031A8.094 8.094 0 008 0zm1.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM11 8a3 3 0 11-6 0 3 3 0 016 0z"></path>\n</svg>\n      Labels\n    </summary>\n\n    <details-menu\n        src="/requestly/requestly-demo/issues/123456789/show_partial?partial=issues%2Fsidebar%2Flabels_menu_content"\n        preload\n      class="select-menu-modal position-absolute right-0 hx_rsm-modal js-discussion-sidebar-menu"\n      style="z-index: 99; overflow: visible;"\n      data-multiple>\n      <div class="select-menu-header rounded-top-2">\n        <span class="select-menu-title">Apply labels to this issue</span>\n        <button data-toggle-for="labels-select-menu" aria-label="Close menu" type="button" data-view-component="true" class="close-button hx_rsm-close-button btn-link"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">\n    <path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>\n</svg></button>\n      </div>\n        <div class="select-menu-filters">\n    <div class="select-menu-text-filter hx_form-control-spinner-wrapper">\n      <input type="text" id="label-filter-field" class="form-control js-label-filter-field js-filterable-field"\n             placeholder="Filter labels" aria-label="Filter labels" autocomplete="off" autofocus>\n      <svg style="box-sizing: content-box; color: var(--color-icon-primary);" width="16" height="16" viewBox="0 0 16 16" fill="none" data-view-component="true" class="hx_form-control-spinner anim-rotate">\n  <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke" />\n  <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke" />\n</svg>\n    </div>\n  </div>\n\n\n      <div class="hx_rsm-content" role="menu">\n          <!-- when data is loaded as HTML via details-menu[src] -->\n          <include-fragment>\n            <svg style="box-sizing: content-box; color: var(--color-icon-primary);" width="32" height="32" viewBox="0 0 16 16" fill="none" data-view-component="true" class="my-6 mx-auto d-block anim-rotate">\n  <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke" />\n  <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke" />\n</svg>\n            \n          </include-fragment>\n      </div>\n\n    </details-menu>\n  </details>\n\n  <div class="js-issue-labels d-flex flex-wrap">\n      \n<a id="label-daf400" href="/requestly/requestly-demo/labels/web-app" data-name="web-app" style="--label-r:147;--label-g:209;--label-b:186;--label-h:157;--label-s:40;--label-l:69;" data-view-component="true" class="IssueLabel hx_IssueLabel width-fit mb-1 mr-1">\n    <span class="css-truncate css-truncate-target width-fit">web-app</span>\n</a>\n\n</div>\n\n</div>\n',
    responseURL: "https://github.com/requestly/requestly-demo/issues/100000/labels",
    contentType: "text/html; charset=utf-8",
    status: 200,
    statusText: "",
    responseTime: 351,
  },
  {
    timestamp: 1653654849316,
    method: "GET",
    url: "https://github.com/requestly/requestly-demo/show_partial?partial=tree%2Frecently_touched_branches_list",
    requestData: {
      partial: "tree/recently_touched_branches_list",
    },
    response:
      '    <div class="js-socket-channel js-updatable-content"\n        data-channel="12345"\n        data-url="/requestly/requestly-demo/show_partial?partial=tree%2Frecently_touched_branches_list">\n    </div>\n',
    status: 200,
    responseTime: 375,
  },
  {
    timestamp: 1653654850023,
    method: "DELETE",
    url: "https://github.com/requestly/requestly-demo/tree-commit/commit_id",
    requestData: {},
    response:
      '\n\n  <div class="flex-shrink-0 ml-n1 mr-n1 mt-n1 mb-n1 hx_avatar_stack_commit" >\n    \n<div class="AvatarStack flex-self-start  " >\n  <div class="AvatarStack-body" aria-label="wrongsahil" >\n      <a class="avatar avatar-user" style="width:24px;height:24px;" data-skip-pjax="true" data-test-selector="commits-avatar-stack-avatar-link" data-hovercard-type="user" data-hovercard-url="/users/wrongsahil/hovercard" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href="/wrongsahil">\n        <img data-test-selector="commits-avatar-stack-avatar-image" src="https://avatars.githubusercontent.com/u/16779465?s=48&amp;v=4" width="24" height="24" alt="@wrongsahil" class=" avatar-user" />\n</a>  </div>\n</div>\n\n  </div>\n  <div class="flex-1 d-flex flex-items-center ml-3 min-width-0">\n    <div class="css-truncate css-truncate-overflow color-fg-muted" >\n          <a class="commit-author user-mention" title="View all commits by wrongsahil" href="/requestly/requestly-demo/commits?author=wrongsahil">wrongsahil</a>\n    \n  \n\n        <span class="d-none d-sm-inline">\n          <a data-pjax="true" data-test-selector="commit-tease-commit-message" title="chore: added issue templates" class="Link--primary markdown-title" href="/requestly/requestly-demo/commit/commit_id">chore: added issue templates</a>\n        </span>\n    </div>\n    <span\n      class="hidden-text-expander ml-2 d-inline-block d-inline-block d-lg-none"\n      \n    >\n      <button\n        type="button"\n        class="color-fg-default ellipsis-expander js-details-target"\n        aria-expanded="false"\n        \n      >\n        &hellip;\n      </button>\n    </span>\n    <div class="d-flex flex-auto flex-justify-end ml-3 flex-items-baseline">\n        <include-fragment accept="text/fragment+html" src="/requestly/requestly-demo/commit/4ed9549459d91bc6e5acd4837938cae2918dd6b9/rollup?direction=sw" class="d-inline" ></include-fragment>\n      <a\n        href="/requestly/requestly-demo/commit/4ed9549459d91bc6e5acd4837938cae2918dd6b9"\n        class="f6 Link--secondary text-mono ml-2 d-none d-lg-inline"\n        data-pjax="#repo-content-pjax-container"\n        data-turbo-frame="repo-content-turbo-frame"\n        \n      >\n        4ed9549\n      </a>\n      <a\n        href="/requestly/requestly-demo/commit/4ed9549459d91bc6e5acd4837938cae2918dd6b9"\n        class="Link--secondary ml-2"\n        data-pjax="#repo-content-pjax-container"\n        data-turbo-frame="repo-content-turbo-frame"\n        \n      >\n        <relative-time datetime="2022-04-29T19:23:17Z" class="no-wrap">Apr 30, 2022</relative-time>\n      </a>\n    </div>\n  </div>\n  <div class="pl-0 pl-md-5 flex-order-1 width-full Details-content--hidden">\n      <div class="mt-2">\n        <a data-pjax="#repo-content-pjax-container" data-turbo-frame="repo-content-turbo-frame" data-test-selector="commit-tease-commit-message" class="Link--primary text-bold" href="/requestly/requestly-demo/commit/4ed9549459d91bc6e5acd4837938cae2918dd6b9">chore: added issue templates</a>\n      </div>\n    <div class="d-flex flex-items-center">\n      <code class="border d-lg-none mt-2 px-1 rounded-2">4ed9549</code>\n    </div>\n  </div>\n',
    status: 200,
    responseTime: 382,
  },
  {
    timestamp: 1653654850724,
    method: "GET",
    url: "https://github.com/requestly/requestly-demo/overview_actions/master",
    requestData: {},
    response:
      '<a class="btn ml-2 d-none d-md-block" data-hydro-click="{&quot;event_type&quot;:&quot;repository.click&quot;,&quot;payload&quot;:{&quot;target&quot;:&quot;FIND_FILE_BUTTON&quot;,&quot;repository_id&quot;:75255555,&quot;originating_url&quot;:&quot;https://github.com/requestly/requestly-demo/overview_actions/master&quot;,&quot;user_id&quot;:6367566}}" data-hydro-click-hmac="bbaa87f02dc47f71b0cd6f3c0744fe77a43ffc5224431f3459b6c2029bb1306a" data-ga-click="Repository, find file, location:repo overview" data-hotkey="t" data-pjax="true" href="/requestly/requestly-demo/find/master">\n  Go to file\n</a>\n  <details data-view-component="true" class="details-overlay details-reset position-relative d-block">\n  <summary role="button" data-view-component="true" class="btn ml-2">  <span class="d-none d-md-flex flex-items-center">\n        Add file\n        <span class="dropdown-caret ml-1"></span>\n      </span>\n      <span class="d-inline-block d-md-none">\n        <svg aria-label="More options" role="img" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-kebab-horizontal">\n    <path d="M8 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM1.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>\n</svg>\n      </span>\n  \n</summary>\n  <div data-view-component="true">      <ul class="dropdown-menu dropdown-menu-sw">\n        <li class="d-block d-md-none">\n          <a class="dropdown-item" data-hydro-click="{&quot;event_type&quot;:&quot;repository.click&quot;,&quot;payload&quot;:{&quot;target&quot;:&quot;FIND_FILE_BUTTON&quot;,&quot;repository_id&quot;:75255555,&quot;originating_url&quot;:&quot;https://github.com/requestly/requestly-demo/overview_actions/master&quot;,&quot;user_id&quot;:6367566}}" data-hydro-click-hmac="bbaa87f02dc47f71b0cd6f3c0744fe77a43ffc5224431f3459b6c2029bb1306a" data-ga-click="Repository, find file, location:repo overview" data-hotkey="t" data-pjax="true" href="/requestly/requestly-demo/find/master">\n            Go to file\n</a>        </li>\n          <li class="d-block d-md-none dropdown-divider" role="none"></li>\n          <li><!-- \'"` --><!-- </textarea></xmp> --></option></form><form data-turbo="false" data-turbo="false" action="/requestly/requestly-demo/new/master" accept-charset="UTF-8" method="post"><input type="hidden" name="authenticity_token" value="YMMa_vqrA4JzqFuLy4DkXRgjw1i3kkzivTpv9ojZHVqr-DgGZzCVpzpdE7tjbs9FskOyg5NjN7cL_Mku0TCeqA" />\n  <button type="submit" data-view-component="true" class="dropdown-item btn-link">  Create new file\n  \n</button></form></li>\n\n          <li><a href="/requestly/requestly-demo/upload/master" class="dropdown-item">\n  Upload files\n</a></li>\n\n      </ul>\n</div>\n</details>',
    status: 200,
    responseTime: 382,
  },
  {
    timestamp: 1653654851725,
    method: "GET",
    url: "https://github.com/requestly/requestly-demo/security/overall-count",
    requestData: {},
    response: "",
    status: 200,
    responseTime: 387,
  },
  {
    timestamp: 1653654852011,
    method: "PUT",
    url: "https://github.com/requestly/requestly-demo/issues/100000/labels",
    requestData:
      '------WebKitFormBoundaryLCVNm5cBJB1Ps1CX\r\nContent-Disposition: form-data; name="_method"\r\n\r\nput\r\n------WebKitFormBoundaryLCVNm5cBJB1Ps1CX\r\nContent-Disposition: form-data; name="issue[labels][]"\r\n\r\n\r\n------WebKitFormBoundaryLCVNm5cBJB1Ps1CX\r\nContent-Disposition: form-data; name="issue[labels][]"\r\n\r\n2937004376\r\n------WebKitFormBoundaryLCVNm5cBJB1Ps1CX--\r\n',
    response:
      '<div class="discussion-sidebar-item js-discussion-sidebar-item">\n  \n\n\n  <details class="details-reset details-overlay select-menu hx_rsm label-select-menu"\n    id="labels-select-menu">\n\n    <summary class="text-bold discussion-sidebar-heading discussion-sidebar-toggle hx_rsm-trigger"\n             aria-haspopup="menu"\n             data-hotkey="l"\n             data-menu-trigger="labels-select-menu">\n      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-gear">\n    <path fill-rule="evenodd" d="M7.429 1.525a6.593 6.593 0 011.142 0c.036.003.108.036.137.146l.289 1.105c.147.56.55.967.997 1.189.174.086.341.183.501.29.417.278.97.423 1.53.27l1.102-.303c.11-.03.175.016.195.046.219.31.41.641.573.989.014.031.022.11-.059.19l-.815.806c-.411.406-.562.957-.53 1.456a4.588 4.588 0 010 .582c-.032.499.119 1.05.53 1.456l.815.806c.08.08.073.159.059.19a6.494 6.494 0 01-.573.99c-.02.029-.086.074-.195.045l-1.103-.303c-.559-.153-1.112-.008-1.529.27-.16.107-.327.204-.5.29-.449.222-.851.628-.998 1.189l-.289 1.105c-.029.11-.101.143-.137.146a6.613 6.613 0 01-1.142 0c-.036-.003-.108-.037-.137-.146l-.289-1.105c-.147-.56-.55-.967-.997-1.189a4.502 4.502 0 01-.501-.29c-.417-.278-.97-.423-1.53-.27l-1.102.303c-.11.03-.175-.016-.195-.046a6.492 6.492 0 01-.573-.989c-.014-.031-.022-.11.059-.19l.815-.806c.411-.406.562-.957.53-1.456a4.587 4.587 0 010-.582c.032-.499-.119-1.05-.53-1.456l-.815-.806c-.08-.08-.073-.159-.059-.19a6.44 6.44 0 01.573-.99c.02-.029.086-.075.195-.045l1.103.303c.559.153 1.112.008 1.529-.27.16-.107.327-.204.5-.29.449-.222.851-.628.998-1.189l.289-1.105c.029-.11.101-.143.137-.146zM8 0c-.236 0-.47.01-.701.03-.743.065-1.29.615-1.458 1.261l-.29 1.106c-.017.066-.078.158-.211.224a5.994 5.994 0 00-.668.386c-.123.082-.233.09-.3.071L3.27 2.776c-.644-.177-1.392.02-1.82.63a7.977 7.977 0 00-.704 1.217c-.315.675-.111 1.422.363 1.891l.815.806c.05.048.098.147.088.294a6.084 6.084 0 000 .772c.01.147-.038.246-.088.294l-.815.806c-.474.469-.678 1.216-.363 1.891.2.428.436.835.704 1.218.428.609 1.176.806 1.82.63l1.103-.303c.066-.019.176-.011.299.071.213.143.436.272.668.386.133.066.194.158.212.224l.289 1.106c.169.646.715 1.196 1.458 1.26a8.094 8.094 0 001.402 0c.743-.064 1.29-.614 1.458-1.26l.29-1.106c.017-.066.078-.158.211-.224a5.98 5.98 0 00.668-.386c.123-.082.233-.09.3-.071l1.102.302c.644.177 1.392-.02 1.82-.63.268-.382.505-.789.704-1.217.315-.675.111-1.422-.364-1.891l-.814-.806c-.05-.048-.098-.147-.088-.294a6.1 6.1 0 000-.772c-.01-.147.039-.246.088-.294l.814-.806c.475-.469.679-1.216.364-1.891a7.992 7.992 0 00-.704-1.218c-.428-.609-1.176-.806-1.82-.63l-1.103.303c-.066.019-.176.011-.299-.071a5.991 5.991 0 00-.668-.386c-.133-.066-.194-.158-.212-.224L10.16 1.29C9.99.645 9.444.095 8.701.031A8.094 8.094 0 008 0zm1.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM11 8a3 3 0 11-6 0 3 3 0 016 0z"></path>\n</svg>\n      Labels\n    </summary>\n\n    <details-menu\n        src="/requestly/requestly-demo/issues/123456789/show_partial?partial=issues%2Fsidebar%2Flabels_menu_content"\n        preload\n      class="select-menu-modal position-absolute right-0 hx_rsm-modal js-discussion-sidebar-menu"\n      style="z-index: 99; overflow: visible;"\n      data-multiple>\n      <div class="select-menu-header rounded-top-2">\n        <span class="select-menu-title">Apply labels to this issue</span>\n        <button data-toggle-for="labels-select-menu" aria-label="Close menu" type="button" data-view-component="true" class="close-button hx_rsm-close-button btn-link"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">\n    <path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>\n</svg></button>\n      </div>\n        <div class="select-menu-filters">\n    <div class="select-menu-text-filter hx_form-control-spinner-wrapper">\n      <input type="text" id="label-filter-field" class="form-control js-label-filter-field js-filterable-field"\n             placeholder="Filter labels" aria-label="Filter labels" autocomplete="off" autofocus>\n      <svg style="box-sizing: content-box; color: var(--color-icon-primary);" width="16" height="16" viewBox="0 0 16 16" fill="none" data-view-component="true" class="hx_form-control-spinner anim-rotate">\n  <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke" />\n  <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke" />\n</svg>\n    </div>\n  </div>\n\n\n      <div class="hx_rsm-content" role="menu">\n          <!-- when data is loaded as HTML via details-menu[src] -->\n          <include-fragment>\n            <svg style="box-sizing: content-box; color: var(--color-icon-primary);" width="32" height="32" viewBox="0 0 16 16" fill="none" data-view-component="true" class="my-6 mx-auto d-block anim-rotate">\n  <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" vector-effect="non-scaling-stroke" />\n  <path d="M15 8a7.002 7.002 0 00-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" vector-effect="non-scaling-stroke" />\n</svg>\n            \n          </include-fragment>\n      </div>\n\n    </details-menu>\n  </details>\n\n  <div class="js-issue-labels d-flex flex-wrap">\n      \n<a id="label-daf400" href="/requestly/requestly-demo/labels/web-app" data-name="web-app" style="--label-r:147;--label-g:209;--label-b:186;--label-h:157;--label-s:40;--label-l:69;" data-view-component="true" class="IssueLabel hx_IssueLabel width-fit mb-1 mr-1">\n    <span class="css-truncate css-truncate-target width-fit">web-app</span>\n</a>\n\n</div>\n\n</div>\n',
    responseURL: "https://github.com/requestly/requestly-demo/issues/100000/labels",
    contentType: "text/html; charset=utf-8",
    status: 200,
    statusText: "",
    responseTime: 687,
  },
  {
    timestamp: 1653654861316,
    method: "GET",
    url: "https://github.com/requestly/requestly-demo/my_forks_menu_content?can_fork=true",
    requestData: {
      can_fork: true,
    },
    response:
      '<header class="SelectMenu-header">\n  <h3 class="SelectMenu-title">Your existing forks</h3>\n  <button class="SelectMenu-closeButton" type="button" aria-label="Close menu" data-toggle-for="my-forks-menu-75255555">\n    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">\n    <path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>\n</svg>\n  </button>\n</header>\n  <div class="p-2 pl-3">\n    You don\'t have any forks of this repository.\n  </div>\n\n  <footer class="SelectMenu-footer p-0 position-sticky">\n    <a href="/requestly/requestly-demo/fork" data-hydro-click="{&quot;event_type&quot;:&quot;repository.click&quot;,&quot;payload&quot;:{&quot;target&quot;:&quot;FORK_BUTTON&quot;,&quot;repository_id&quot;:75255555,&quot;originating_url&quot;:&quot;https://github.com/requestly/requestly-demo/my_forks_menu_content?can_fork=true&quot;,&quot;user_id&quot;:6367566}}" data-hydro-click-hmac="2bf61a18b1095675804c7aa14d90a325e0fce90f1df3385eb25e32ce7630c370" data-ga-click="Repository, show fork modal, action:repositories#my_forks_menu_content; text:Fork" role="menuitem" data-view-component="true" class="SelectMenu-item btn rounded-0 border-bottom-0 text-normal f6">  <svg width="20" aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" data-view-component="true" class="octicon octicon-plus mr-2 text-center">\n    <path fill-rule="evenodd" d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 110 1.5H8.5v4.25a.75.75 0 11-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"></path>\n</svg>\n      Create a new fork\n  \n</a>  </footer>\n',
    status: 200,
    responseTime: 290,
  },
  {
    timestamp: 1653654863686,
    method: "GET",
    url: "https://github.com/requestly/requestly-demo/lists",
    requestData: {},
    response:
      '<div\n  class="js-user-list-menu-content-root js-social-updatable text-left"\n  data-url="/requestly/requestly-demo/lists"\n  data-batch-update-url="/stars/lazyvab/list-menu-batch"\n  data-update-after-submit\n>\n  <input type="hidden" value="KTCWSbaBx8jgredqQBx7HL99MgE7YJyoEl6sidvbIphJ3DYVlDBTQqKPzJu2nsLwGWJtm-FPM_2EWgpNmY1W7g" data-csrf="true" class="js-user-list-batch-update-csrf" />\n  <div class="d-flex flex-column" style="max-height: 360px">\n    <header class="SelectMenu-header px-3 py-2">\n        <h5 class="SelectMenu-title f5">Suggested lists</h5>\n\n      <button class="SelectMenu-closeButton" type="button" aria-label="Close menu" data-toggle-for="details-user-list-75255555">\n        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">\n    <path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>\n</svg>\n      </button>\n    </header>\n\n\n      <div class="SelectMenu-list flex-1 overflow-y-auto px-3 pb-2 mb-0">\n        <form class="js-user-list-menu-form" data-turbo="false" action="/requestly/requestly-demo/lists" accept-charset="UTF-8" method="post"><input type="hidden" name="_method" value="put" autocomplete="off" /><input type="hidden" name="authenticity_token" value="l-v5GqeSWwu6dBpd-BG7eK2se-XQpZXhAV2AV_GUEXNEGR4DXGos7gN0B7f_c9TCv48k-E-1NlGAoa7W3ct6yQ" autocomplete="off" />\n          <input type="hidden" name="repository_id" value="75255555">\n          <input type="hidden" name="context" value="user_list_menu">\n          <input type="hidden" name="list_ids[]" value="">\n\n          <div id="filter-menu-user-list-75255555" data-filter-list>\n              <div class="form-checkbox mt-1 mb-0 p-1">\n                <label class="d-flex">\n                  <input\n                    type="checkbox"\n                    class="mx-0 js-user-list-menu-item"\n                    name="list_names[]"\n                    value="🔮 Future ideas"\n                    \n                  >\n                  <span data-view-component="true" class="Truncate ml-2 text-normal f5">\n    <span data-view-component="true" class="Truncate-text"><g-emoji class="g-emoji" alias="crystal_ball" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f52e.png">🔮</g-emoji> Future ideas</span>\n</span>\n                </label>\n              </div>\n              <div class="form-checkbox mt-1 mb-0 p-1">\n                <label class="d-flex">\n                  <input\n                    type="checkbox"\n                    class="mx-0 js-user-list-menu-item"\n                    name="list_names[]"\n                    value="🚀 My stack"\n                    \n                  >\n                  <span data-view-component="true" class="Truncate ml-2 text-normal f5">\n    <span data-view-component="true" class="Truncate-text"><g-emoji class="g-emoji" alias="rocket" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f680.png">🚀</g-emoji> My stack</span>\n</span>\n                </label>\n              </div>\n              <div class="form-checkbox mt-1 mb-0 p-1">\n                <label class="d-flex">\n                  <input\n                    type="checkbox"\n                    class="mx-0 js-user-list-menu-item"\n                    name="list_names[]"\n                    value="✨ Inspiration"\n                    \n                  >\n                  <span data-view-component="true" class="Truncate ml-2 text-normal f5">\n    <span data-view-component="true" class="Truncate-text"><g-emoji class="g-emoji" alias="sparkles" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/2728.png">✨</g-emoji> Inspiration</span>\n</span>\n                </label>\n              </div>\n\n            <div class="SelectMenu-blankslate" data-filter-empty-state hidden>\n              No results found.\n            </div>\n          </div>\n</form>      </div>\n  </div>\n\n  <footer class="SelectMenu-footer px-2">\n    <button data-repository-id="75255555" type="button" data-view-component="true" class="user-lists-menu-action js-user-lists-create-trigger btn-invisible btn btn-block text-left text-normal rounded-1 px-2">  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-plus mr-1">\n    <path fill-rule="evenodd" d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 110 1.5H8.5v4.25a.75.75 0 11-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"></path>\n</svg>\n      Create list\n      <span class="js-user-list-create-trigger-text">\n      </span>\n  \n</button>  </footer>\n  <template class="js-user-list-create-dialog-template" data-label="Create list">\n  <div class="Box-header">\n    <h2 class="Box-title">Create list</h2>\n  </div>\n  <form class="Box-body d-flex flex-column p-3 js-user-list-form" data-turbo="false" action="/stars/lazyvab/lists" accept-charset="UTF-8" method="post"><input type="hidden" name="authenticity_token" value="AToS98FBqaIgZVam4MNsKuNygX4OEbKstql5nJ6R-W4eaSdGizwS5fS1un3VNCFNfqVRDoHAcGo-PeP0g6WwCw" autocomplete="off" />\n        <p class="color-fg-subtle mb-3">Create a list to organize your starred repositories.</p>\n      <input type="hidden" name="repository_id" value="{{ repositoryId }}">\n\n  <div class="form-group mx-0 mt-0 mb-2 js-user-list-input-container js-characters-remaining-container position-relative">\n    <auto-check src="/stars/lazyvab/list-check?attr=name" required>\n      <text-expander keys=":" data-emoji-url="/autocomplete/emoji">\n        <input\n          type="text"\n          name="user_list[name]"\n          class="form-control js-user-list-input js-characters-remaining-field"\n          placeholder="⭐️ Name this list"\n          value="{{ placeholderName }}"\n          aria-label="List name"\n          maxlength="32"\n          data-maxlength="32"\n          autofocus\n          required\n        >\n      </text-expander>\n      <input type="hidden" value="zApVcww-EWrdatu8AlqZA42my9KiH7JoQurFj1WTUGpo7k1ztfba9aUSg-0Y3qwMNsZorcPO1KH6hET7NtwiHg" data-csrf="true" />\n    </auto-check>\n    <p\n      class="note error position-relative js-user-list-error"\n       hidden\n    >\n      Name .\n    </p>\n    <p class="mt-1 text-small float-right js-characters-remaining" data-suffix="remaining" hidden>\n      32 remaining\n    </p>\n  </div>\n  <div class="form-group mx-0 mt-0 mb-2 js-user-list-input-container js-characters-remaining-container position-relative">\n    <text-expander keys=":" data-emoji-url="/autocomplete/emoji">\n      <textarea\n        name="user_list[description]"\n        class="form-control js-user-list-input js-characters-remaining-field"\n        placeholder="Write a description"\n        aria-label="List description"\n        maxlength="160"\n        data-maxlength="160"\n        style="height: 74px; min-height: 74px"\n      ></textarea>\n    </text-expander>\n    <p\n      class="note error position-relative js-user-list-error"\n       hidden\n    >\n      Description .\n    </p>\n    <p class="mt-1 text-small float-right js-characters-remaining" data-suffix="remaining" hidden>\n      160 remaining\n    </p>\n  </div>\n  <div hidden="hidden" data-generic-message="Unable to save your list at this time." data-view-component="true" class="js-user-list-base flash flash-error mx-0 mt-0 mb-2">\n  \n  \n    .\n\n\n  \n</div>      <button disabled="disabled" data-disable-invalid="true" data-submitting-message="Creating..." type="submit" data-view-component="true" class="btn-primary btn btn-block mt-2">  Create\n  \n</button>\n\n  <p class="note mt-2 mb-0">\n    <strong>Tip:</strong> type <code>:</code> to add emoji to the name or description.\n  </p>\n</form>\n  <div data-view-component="true" class="Box-footer Box-row--gray text-small color-fg-muted d-flex flex-items-baseline py-2">\n  <span title="Feature Release Label: Beta" aria-label="Feature Release Label: Beta" data-view-component="true" class="Label Label--success Label--inline px-2 mr-2">Beta</span>\n  <span class="mr-1">Lists are currently in beta.</span>\n  <a href="/github/feedback/discussions/categories/lists-feedback">Share feedback and report bugs.</a>\n</div>\n</template>\n\n</div>\n',
    status: 200,
    responseTime: 398,
  },
];

export default mockNetworkEvents;
