// ==UserScript==
// @name         YUME-Evolved
// @namespace    https://github.com/Memory2314/YUME-Evolved
// @version      1.0
// @description  强大的梦乡增强脚本
// @author       Memory
// @match        *://*.yume.ly/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 用户选项 可控制开启(true)或关闭(false)
    let enableCache = true; // 默认开启缓存, 建议开启
    var apiUrl = 'https://raw.gitmirror.com/Memory2314/YUME-API-collect/main/api/dream/alive'; // api地址
    var enableDisableFormSubmission = true; // 禁止表单提交行为(用于修复替换后回车提交刷新的bug), 建议开启
    var enableAddFAB = false; // 主页浮动按钮
    var enableRemovePanel = false; // 移除公告
    var enableRemoveTips = false; // 移除造梦提示
    var enableOptTags = false; // Tags优化
    var enableOptComments = false; // 评论区优化
    var enableOptCreateDream = false; // 造梦优化
    var enableOptLock = false; // 仅自己图标优化
    var enableOptWorldLine = false; // 世界线优化
    var enableOptPagePoints = false; // 页面指示器优化

    // 开发者选项
    var enableload = true; // 启用初始化加载


    // 部分全局变量初始化
    var ShowPage = getShowPage(); // 当前显示的页数

    function load() {
        // 函数用于根据URL加载CSS文件
        function loadCSS(url) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
        }

        // 函数用于加载JS文件
        function loadJS(url) {
            var script = document.createElement('script');
            script.src = url;
            document.head.appendChild(script);
        }

        // 加载MDUI的CSS和JS资源，根据enableCache决定是否缓存
        if (enableCache) {
            // 检查本地存储是否有缓存的资源
            const cachedCSS = localStorage.getItem('mdui.css');
            const cachedMDIcon = localStorage.getItem('MDIcon.css');
            const cachedJS = localStorage.getItem('mdui.global.js');

            if (cachedCSS) {
                console.log('mdui.css已缓存,正在加载...');
                // 创建一个<style>标签
                const styleElement = document.createElement('style');
                // 将缓存的CSS内容设置为<style>标签的文本内容
                styleElement.textContent = cachedCSS;
                // 将<style>标签添加到<head>中
                document.head.appendChild(styleElement);
                console.log('mdui.css加载完毕');
            } else {
                console.log('你好像是第一次加载mdui.css呢');
                loadCSS('https://unpkg.com/mdui@2/mdui.css');
                // 缓存加载完成后，将新加载的资源存入本地存储
                fetch('https://unpkg.com/mdui@2/mdui.css')
                    .then(response => response.text())
                    .then(css => {
                        localStorage.setItem('mdui.css', css);
                        console.log('mdui.css已存入缓存');
                    });
            }

            if (cachedMDIcon) {
                console.log('Material Icons已缓存,正在加载...');
                // 创建一个<style>标签
                const styleElement = document.createElement('style');
                // 将缓存的CSS内容设置为<style>标签的文本内容
                styleElement.textContent = cachedMDIcon;
                // 将<style>标签添加到<head>中
                document.head.appendChild(styleElement);
                console.log('Material Icons加载完毕');
            } else {
                console.log('你好像是第一次加载Material Icons呢');
                loadCSS('https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone');
                // 缓存加载完成后，将新加载的资源存入本地存储
                fetch('https://fonts.googleapis.com/icon?family=Material+Icons+Two+Tone')
                    .then(response => response.text())
                    .then(css => {
                        localStorage.setItem('MDIcon.css', css);
                        console.log('Material Icons已存入缓存');
                    });
            }

            if (cachedJS) {
                console.log('mdui.global.js已缓存,正在加载...');
                // 创建一个<script>标签
                const scriptElement = document.createElement('script');
                // 将缓存的JS内容设置为<script>标签的文本内容
                scriptElement.textContent = cachedJS;
                // 将<script>标签添加到<body>中（或者<head>中，根据需要）
                document.body.appendChild(scriptElement);
                console.log('mdui.global.js加载完毕');
            } else {
                console.log('你好像是第一次加载mdui.global.js呢');
                loadJS('https://unpkg.com/mdui@2/mdui.global.js');
                fetch('https://unpkg.com/mdui@2/mdui.global.js')
                    .then(response => response.text())
                    .then(js => {
                        localStorage.setItem('mdui.global.js', js);
                        console.log('mdui.global.js已存入缓存');
                    });
            }

        } else {
            console.log('缓存未开启,正在从网络请求');
            loadCSS('https://unpkg.com/mdui@2/mdui.css');
            loadJS('https://unpkg.com/mdui@2/mdui.global.js');
        }
    }

    // 定义函数来根据选择器删除所有匹配的元素
    function removeElementsBySelector(selector) {
        var elements = document.querySelectorAll(selector);
        if (elements) {
            elements.forEach(function (element) {
                element.remove();
                return true
            });
        } else {
            return false
        }

    }

    // 禁止表单提交行为(用于修复替换后回车提交刷新的bug)
    function disableFormSubmission() {
        // 获取所有的表单元素
        var forms = document.getElementsByTagName('form');
        for (var i = 0; i < forms.length; i++) {
            forms[i].addEventListener('submit', function (event) {
                // 阻止默认的表单提交行为
                event.preventDefault();
            });
        }
    }

    // 获取资源
    async function getRes(url) {
        try {
            const dreamIdList = [];
            const response = await fetch(url, {
                cache: 'no-store'  // 禁止使用磁盘缓存
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.text();
            const lines = data.split('\n');

            lines.forEach(line => {
                const dreamId = parseInt(line.trim(), 10);
                if (!isNaN(dreamId)) {
                    dreamIdList.push(dreamId);
                }
            });

            return dreamIdList;
        } catch (error) {
            throw error;
        }
    }


    // 获取当前页数
    function getShowPage() {
        const urlParams = new URLSearchParams(window.location.search);
        var pageNum = urlParams.get('page');
        if (pageNum) {
            return pageNum;
        } else {
            return 1;

        }
    }

    // 通过Api获取梦境数
    async function getApiCount(apiUrl) {
        var DreamIds = await getRes(apiUrl);
        return DreamIds.length
    }

    // 根据id获取梦境
    function getdreamById(DreamId) {
        // 返回一个新的 Promise 对象
        return fetch(`http://yume.ly/dream/${DreamId}`)
            .then(response => response.text())  // 将响应内容作为文本返回
            .then(html => {
                // 创建一个临时的div元素来容纳返回的HTML内容
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                // 获取原始梦境
                var entryClearit = tempDiv.querySelector('.entry.clearit');
                // 隐藏评论
                var comments = entryClearit.querySelector('.comments');
                var firstChild = comments.children[0];
                firstChild.firstElementChild.className = 'loadComments';
                var secondChild = comments.children[1];
                secondChild.setAttribute('style', 'display: none;');
                // 返回整理后的梦境内容
                return entryClearit;
            });
    }

    // 添加单个梦境
    async function addDream(DreamId) {
        try {
            const dreamContent = await getdreamById(DreamId);
            return dreamContent; // 返回梦境内容
        } catch (error) {
            console.error(`获取梦境 ID ${DreamId} 失败：`, error);
            return null; // 返回 null 或其他占位符，表示获取失败
        }
    }

    // 添加多个梦境
    async function addDreams(DreamIdList) {
        try {
            // 使用 Promise.all 来并行获取所有梦境内容
            const promises = DreamIdList.map(DreamId => {
                console.log(`正在尝试获取ID ${DreamId}的梦境内容`);
                return addDream(DreamId);
            });

            const dreamContents = await Promise.all(promises); // 等待所有梦境内容获取完成

            // 按顺序将梦境内容添加到页面中（跳过获取失败的梦境）
            dreamContents.forEach(dreamContent => {
                if (dreamContent) {
                    columnHomeA.insertBefore(dreamContent, columnHomeA.firstChild);
                }
            });

            console.log('所有梦境添加完成');
        } catch (error) {
            console.error('添加梦境失败：', error);
        }
    }


    // 主页浮动按钮
    async function addFAB() {
        var currentPageUrl = window.location.href;

        if (currentPageUrl != "http://yume.ly/dream/create") {
            // 移除造梦按钮
            removeElementsBySelector('a[href="/dream/create"].fancyBtn.rr');
            console.log('Remove CreateDream');

            // 创建回到顶部按钮
            const scrollTopButton = document.createElement('mdui-fab');
            scrollTopButton.setAttribute('icon', 'keyboard_arrow_up--two-tone');
            scrollTopButton.classList.add('floating-button'); // 添加浮动按钮的类名
            scrollTopButton.style = 'position: fixed; bottom: 100px; right: 20px; z-index: 1000;';
            scrollTopButton.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            // 创建造梦按钮
            const dreamButton = document.createElement('mdui-fab');
            dreamButton.setAttribute('extended', '');
            dreamButton.setAttribute('icon', 'add--two-tone');
            dreamButton.setAttribute('href', '/dream/create');
            dreamButton.classList.add('floating-button'); // 添加浮动按钮的类名
            dreamButton.style = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
            dreamButton.textContent = '造梦';

            // 将按钮添加到页面
            document.body.appendChild(scrollTopButton);
            document.body.appendChild(dreamButton);

            // 添加自定义样式
            var style = document.createElement('style');
            style.innerHTML = `
            /* 初始状态 */
            .floating-button {
                opacity: 0;
                transition: all 0.3s;
                transform: translateY(100px);
            }

            /* 显示状态 */
            .floating-button.show {
                opacity: 1;
                transform: translateY(0);
            }

        `;
            document.head.appendChild(style);

            // 初始显示状态
            scrollTopButton.classList.add('floating-button', 'show'); // 添加 'show' 类来确保初始显示
            dreamButton.classList.add('floating-button', 'show'); // 添加 'show' 类来确保初始显示

            var lastScrollTop = 0;
            var ticking = false;

            function updateScroll() {
                var currentScrollTop = window.scrollY || document.documentElement.scrollTop;

                if (currentScrollTop > lastScrollTop) {
                    // 向下滚动，隐藏按钮
                    scrollTopButton.classList.remove('show');
                    dreamButton.classList.remove('show');
                } else {
                    // 向上滚动或者页面初次加载，显示按钮
                    scrollTopButton.classList.add('show');
                    dreamButton.classList.add('show');
                }

                lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // 防止 iOS 中出现负值
                ticking = false;
            }

            // 监听页面滚动事件
            window.addEventListener('scroll', function () {
                if (!ticking) {
                    window.requestAnimationFrame(updateScroll);
                    ticking = true;
                }
            });
        }

    }

    // 移除公告
    async function removePanel() {
        // 移除公告部分
        removeElementsBySelector('#columnHomeB');
        console.log('Remove sidePanel');

        // 获取 class="columns clearit" 的 div 元素
        var columns = document.querySelector('div.columns.clearit');
        if (!columns) {
            console.log('Element with class="columns clearit" not found.');
            return; // 如果找不到元素，退出函数
        }

        // 获取 class="avatarMedium" 的 span 元素
        var avatarMedium = document.querySelector('span.avatarMedium');
        if (!avatarMedium) {
            console.log('Element with class="avatarMedium" not found.');
            return; // 如果找不到元素，退出函数
        }

        // 获取页面头部宽度和 avatar 宽度
        var columnsWidth = columns.offsetWidth;
        var avatarMediumWidth = avatarMedium.offsetWidth;

        // 获取所有 class="dream clearit" 的 div 元素
        var dreamDivs = document.querySelectorAll('div.dream.clearit');
        dreamDivs.forEach(function (div) {
            div.style.width = (columnsWidth - avatarMediumWidth) + 'px';
        });

        // 获取所有 class="comments" 的 div 元素
        var commentDivs = document.querySelectorAll('div.comments');
        commentDivs.forEach(function (div) {
            div.style.width = (columnsWidth - avatarMediumWidth - 70) + 'px';
        });

        // 获取所有 class="content" 的 textarea 元素
        var commentDivs = document.querySelectorAll('textarea.content');
        commentDivs.forEach(function (div) {
            div.style.width = (columnsWidth - avatarMediumWidth - 140) + 'px';
        });
    }

    // 移除造梦提示
    async function removeTips() {
        var currentPageUrl = window.location.href;

        if (currentPageUrl === "http://yume.ly/dream/create") {
            console.log("This is the create dream page.");
            // 移除造梦提示部分
            removeElementsBySelector('#columnB');
            console.log('Remove Tips');

            // 获取 class="columns clearit" 的 div 元素
            var columns = document.querySelector('div.columns.clearit');
            if (!columns) {
                console.log('Element with class="columns clearit" not found.');
                return; // 如果找不到元素，退出函数
            }

            // 获取页面头部宽度和 avatar 宽度
            var columnsWidth = columns.offsetWidth;

            // 获取 class="entry clearit" 的 div 元素
            var dreamDivs = document.querySelector('div.entry.clearit');
            dreamDivs.style.width = (columnsWidth) + 'px';

            // 获取 id="title" 的 input 元素
            var title = document.getElementById('title');
            title.style.width = (columnsWidth - 122) + 'px';

            // 获取 id="tags" 的 input 元素
            var tags = document.getElementById('tags');
            tags.style.width = (columnsWidth - 60) + 'px';
        } else {
            console.log("This is not the create dream page.");
        }
    }

    // Tags优化
    async function optTags() {
        const TAGsWidth = 83.14; // TAGs按钮宽度
        const funWidth = 76.2; // 功能按钮宽度

        // 将标签替换为下拉菜单
        function replaceTagsWithDropdown(element) {
            // 创建下拉菜单元素
            var dropdown = document.createElement('mdui-dropdown');
            dropdown.setAttribute('trigger', 'click'); // 点击触发下拉菜单
            dropdown.setAttribute('stay-open-on-click', ''); // 点击菜单项后保持菜单打开

            // 创建触发菜单的按钮
            var button = document.createElement('mdui-button');
            button.setAttribute('slot', 'trigger');

            // 根据元素的类别设置按钮文本和样式
            if (!element.classList.contains('tools') && !element.classList.contains('rr')) {
                button.textContent = 'TAGs'; // 普通标签
                button.style.marginLeft = '30px'; // 设置左边距为30px，用于左对齐
            } else {
                button.textContent = '功能'; // 工具类标签
                var entryMainWidth = document.querySelector('div.entryMain').offsetWidth;
                button.style.marginLeft = (entryMainWidth - TAGsWidth - funWidth - 60) + 'px'; // 动态设置左边距
            }

            dropdown.appendChild(button);

            // 创建菜单
            var menu = document.createElement('mdui-menu');

            // 遍历原始元素下的所有链接标签，创建菜单项
            element.querySelectorAll('a').forEach(function (tag) {
                var menuItem = document.createElement('mdui-menu-item');
                menuItem.innerHTML = tag.innerHTML; // 使用链接的内容作为菜单项文本
                menuItem.setAttribute('href', tag.getAttribute('href')); // 设置菜单项的链接地址
                menu.appendChild(menuItem);
            });

            dropdown.appendChild(menu);

            // 用创建的下拉菜单替换原始元素
            element.parentNode.replaceChild(dropdown, element);
        }

        // 选择所有相关元素，并应用替换函数
        document.querySelectorAll('div.tags, div.tools.rr').forEach(replaceTagsWithDropdown);
    }

    // 评论区优化
    async function optComments() {
        var currentPageUrl = window.location.href;

        if (currentPageUrl != "http://yume.ly/dream/create") {
            // 获取所有的 textarea 元素
            var textareas = document.querySelectorAll('textarea[name="content"]');

            // 遍历每个 textarea 元素
            textareas.forEach(textarea => {
                // 创建 mdui-text-field 元素
                var mduiTextField = document.createElement('mdui-text-field');
                mduiTextField.setAttribute('class', 'content');
                mduiTextField.setAttribute('variant', 'outlined');
                mduiTextField.setAttribute('rows', '1');
                mduiTextField.setAttribute('autosize', true);

                // 复制 textarea 的值到 mdui-text-field
                mduiTextField.value = textarea.value;

                // 替换 textarea
                textarea.parentNode.replaceChild(mduiTextField, textarea);

                // 添加点击事件监听器
                mduiTextField.addEventListener('click', function () {
                    var submitReply = mduiTextField.nextElementSibling;
                    // 切换显示状态
                    submitReply.style.display = 'block';
                });
            });

            // 找到所有要替换的原始 input 元素
            var inputBtn = document.querySelectorAll('input.inputBtn.tinyBtn');

            inputBtn.forEach(function (inputSubmit) {
                // 创建新的 mdui-button 元素
                var mduiButton = document.createElement('mdui-button');
                mduiButton.textContent = '写好了';

                // 替换原始 input 元素
                inputSubmit.parentNode.replaceChild(mduiButton, inputSubmit);
                mduiButton.style.marginTop = '10px';

                // 添加点击事件监听器
                mduiButton.addEventListener('click', function () {
                    var form = mduiButton.parentNode.parentNode;
                    var action = form.getAttribute('action');
                    const formhash = form.querySelector('[name="formhash"]').value;
                    const lastview = form.querySelector('[name="lastview"]').value;
                    var content = form.querySelector('mdui-text-field').value;
                    // 构建要发送的数据对象
                    var formData = new FormData();
                    formData.append('content', content);
                    formData.append('lastview', lastview);
                    formData.append('formhash', formhash);
                    formData.append('submit', 'submit');

                    // 发送 POST 请求
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', 'http://yume.ly' + action + '?ajax=1');
                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            console.log('请求成功');
                        } else {
                            console.log('请求失败');
                        }
                    };
                    xhr.send(formData);
                });
            });
            // 找到所有要替换的原始元素
            var cancelTips = document.querySelectorAll('a.cancel.tip');

            cancelTips.forEach(function (cancelTip) {
                // 创建新的 mdui-button 元素
                var mduiBtn = document.createElement('mdui-button');
                mduiBtn.setAttribute('variant', 'text');
                mduiBtn.textContent = '取消';

                // 替换原始元素
                cancelTip.parentNode.replaceChild(mduiBtn, cancelTip);
                mduiBtn.style.marginTop = '10px';

                // 添加点击事件监听器
                mduiBtn.addEventListener('click', function () {
                    // 隐藏父节点
                    var parentElement = mduiBtn.parentNode;
                    parentElement.style.display = 'none';
                });
            });
        }
    }

    // 造梦优化
    async function optCreateDream() {
        var currentPageUrl = window.location.href;

        if (currentPageUrl === "http://yume.ly/dream/create") {
            console.log("This is the create dream page.");

            // 添加选项
            function addOption(selectElement, text, value) {
                var mduiMenuItem = document.createElement('mdui-radio');
                mduiMenuItem.setAttribute('value', value);
                mduiMenuItem.textContent = text;
                selectElement.appendChild(mduiMenuItem);
            }

            // 获取当前日期
            function getCurrentDate() {
                // 创建一个新的 Date 对象，它将自动获取当前的日期和时间
                var currentDate = new Date();
                var year = currentDate.getFullYear(); // 获取年份
                var month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // 获取月份并确保是两位数
                var day = ('0' + currentDate.getDate()).slice(-2); // 获取日期并确保是两位数
                var formattedDate = year + '-' + month + '-' + day; // 拼接成 YYYY-MM-DD 格式的字符串
                return formattedDate;
            }

            // 标题
            var titleInput = document.getElementById('title');
            var mduiTextField = document.createElement('mdui-text-field');
            mduiTextField.setAttribute('id', 'title')
            mduiTextField.setAttribute('variant', 'outlined');
            titleInput.parentNode.replaceChild(mduiTextField, titleInput);

            // 写下你的梦境
            var contentTextarea = document.getElementById('content');
            var mduiTextFieldTextarea = document.createElement('mdui-text-field');
            mduiTextFieldTextarea.setAttribute('id', 'content')
            mduiTextFieldTextarea.setAttribute('variant', 'outlined');
            mduiTextFieldTextarea.setAttribute('rows', '15');
            mduiTextFieldTextarea.setAttribute('autosize', true);
            contentTextarea.parentNode.replaceChild(mduiTextFieldTextarea, contentTextarea);

            // 隐私设置
            var privacySelect = document.querySelector('select[name="privacy"]');
            var mduiSelect = document.createElement('mdui-radio-group');
            mduiSelect.setAttribute('name', 'privacy');
            mduiSelect.setAttribute('value', '1');
            addOption(mduiSelect, '所有人可见', '1');
            addOption(mduiSelect, '仅我关注的人可见', '2');
            addOption(mduiSelect, '仅自己可见', '3');
            privacySelect.parentNode.replaceChild(mduiSelect, privacySelect);

            // 元素
            var tagsInput = document.getElementById('tags');
            var mduiTextField = document.createElement('mdui-text-field');
            mduiTextField.setAttribute('id', 'tags')
            mduiTextField.setAttribute('variant', 'outlined');
            tagsInput.parentNode.replaceChild(mduiTextField, tagsInput);

            // 睡眠时间
            // 移除分号, 波浪号
            let xpath1 = "/html/body/div[2]/div[1]/div[1]/form/div/div/div/div[5]/p/text()[1]"; // 开始时间的冒号
            let xpath2 = "/html/body/div[2]/div[1]/div[1]/form/div/div/div/div[5]/p/text()[2]"; // 波浪号
            let xpath3 = "/html/body/div[2]/div[1]/div[1]/form/div/div/div/div[5]/p/text()[3]"; // 结束时间的冒号
            let node1 = document.evaluate(xpath1, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            let node2 = document.evaluate(xpath2, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            let node3 = document.evaluate(xpath3, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            node1.parentNode.removeChild(node1);
            node2.parentNode.removeChild(node2);
            node3.parentNode.removeChild(node3);

            // 开始日期
            var startDateInput = document.querySelector('input[name="startDate"]');
            var mduiTextField = document.createElement('mdui-text-field');
            mduiTextField.setAttribute('name', 'startDate')
            mduiTextField.setAttribute('variant', 'outlined');
            mduiTextField.setAttribute('label', '开始日期');
            mduiTextField.setAttribute('value', getCurrentDate());
            // 插入 <br>
            var br = document.createElement('br');
            startDateInput.parentNode.insertBefore(br, startDateInput);
            startDateInput.parentNode.replaceChild(mduiTextField, startDateInput);

            // 开始小时
            var startHourSelect = document.querySelector('select[name="startHour"]');
            var mduiSlider = document.createElement('mdui-slider');
            mduiSlider.setAttribute('name', 'startHour');
            mduiSlider.setAttribute('min', '0');
            mduiSlider.setAttribute('max', '23');
            mduiSlider.setAttribute('tickmarks', true);
            mduiSlider.labelFormatter = (value) => `${value} 小时`;
            startHourSelect.parentNode.replaceChild(mduiSlider, startHourSelect);

            // 开始分钟
            var startMinuteSelect = document.querySelector('select[name="startMinute"]');
            var mduiSlider = document.createElement('mdui-slider');
            mduiSlider.setAttribute('name', 'startMinute');
            mduiSlider.setAttribute('min', '0');
            mduiSlider.setAttribute('max', '55');
            mduiSlider.setAttribute('tickmarks', true);
            mduiSlider.setAttribute('step', '5');
            mduiSlider.labelFormatter = (value) => `${value} 分钟`;
            startMinuteSelect.parentNode.replaceChild(mduiSlider, startMinuteSelect);

            // 结束日期
            var endDateInput = document.querySelector('input[name="endDate"]');
            var mduiTextField = document.createElement('mdui-text-field');
            mduiTextField.setAttribute('name', 'endDate');
            mduiTextField.setAttribute('variant', 'outlined');
            mduiTextField.setAttribute('label', '结束日期');
            mduiTextField.setAttribute('value', getCurrentDate());
            endDateInput.parentNode.replaceChild(mduiTextField, endDateInput);
            // 结束小时
            var endHourSelect = document.querySelector('select[name="endHour"]');
            var mduiSlider = document.createElement('mdui-slider');
            mduiSlider.setAttribute('name', 'endHour');
            mduiSlider.setAttribute('min', '0');
            mduiSlider.setAttribute('max', '23');
            mduiSlider.setAttribute('tickmarks', true);
            mduiSlider.labelFormatter = (value) => `${value} 小时`;
            endHourSelect.parentNode.replaceChild(mduiSlider, endHourSelect);
            // 结束分钟
            var endMinuteSelect = document.querySelector('select[name="endMinute"]');
            var mduiSlider = document.createElement('mdui-slider');
            mduiSlider.setAttribute('name', 'endMinute');
            mduiSlider.setAttribute('min', '0');
            mduiSlider.setAttribute('max', '55');
            mduiSlider.setAttribute('tickmarks', true);
            mduiSlider.setAttribute('step', '5');
            mduiSlider.labelFormatter = (value) => `${value} 分钟`;
            endMinuteSelect.parentNode.replaceChild(mduiSlider, endMinuteSelect);

            // 梦境类型
            var checkboxes = document.querySelectorAll('label.checkbox');
            checkboxes.forEach(function (label) {
                // 获取<label>下的<input>元素
                var input = label.querySelector('input.checkbox');
                // 获取input的name属性值
                var name = input.getAttribute('name');
                // 创建新的<mdui-checkbox>元素
                var mduiCheckbox = document.createElement('mdui-checkbox');
                mduiCheckbox.setAttribute('name', name);
                mduiCheckbox.textContent = label.textContent.trim();
                // 替换<label>元素
                label.parentNode.replaceChild(mduiCheckbox, label);
            });

            // 保存梦
            var submitBtn = document.querySelector('input.inputBtn');
            var mduiBtn = document.createElement('mdui-button');
            mduiBtn.setAttribute('name', 'submit');
            mduiBtn.setAttribute('variant', 'filled');
            mduiBtn.textContent = '写好了';
            submitBtn.parentNode.replaceChild(mduiBtn, submitBtn);

            // 漏填提示
            var checkdialog = document.createElement('mdui-dialog');
            checkdialog.setAttribute('close-on-overlay-click', '');
            checkdialog.setAttribute('headline', '你好像忘了什么 T-T');
            checkdialog.setAttribute('description', '造梦需要标题和梦境内容 回去再检查检查吧');
            checkdialog.classList.add('check');
            // 在页面添加<mdui-dialog>
            document.body.appendChild(checkdialog);

            // 添加点击事件监听器
            mduiBtn.addEventListener('click', function () {
                const formhash = document.querySelector('[name="formhash"]').value;
                var title = document.getElementById('title').value;
                var content = document.getElementById('content').value;
                var privacy = document.querySelector('mdui-radio-group').value;
                var tags = document.getElementById('tags').value;
                var startDate = document.querySelector('[name="startDate"]').value;
                var startHour = document.querySelector('[name="startHour"]').value;
                var startMinute = document.querySelector('[name="startMinute"]').value;
                var endDate = document.querySelector('[name="endDate"]').value;
                var endHour = document.querySelector('[name="endHour"]').value;
                var endMinute = document.querySelector('[name="endMinute"]').value;
                var type_multi_level = document.querySelector('[name="type_multi_level"]').checked ? 1 : 0;
                var type_recurring = document.querySelector('[name="type_recurring"]').checked ? 1 : 0;
                var type_precognitive = document.querySelector('[name="type_precognitive"]').checked ? 1 : 0;
                var type_OBE = document.querySelector('[name="type_OBE"]').checked ? 1 : 0;

                if (title && content) {
                    // 构建要发送的数据对象
                    var formData = new FormData();
                    formData.append('formhash', formhash);
                    formData.append('title', title);
                    formData.append('content', content);
                    formData.append('privacy', privacy);
                    formData.append('tags', tags);
                    formData.append('startDate', startDate);
                    formData.append('startHour', startHour);
                    formData.append('startMinute', startMinute);
                    formData.append('endDate', endDate);
                    formData.append('endHour', endHour);
                    formData.append('endMinute', endMinute);
                    formData.append('type_multi_level', type_multi_level);
                    formData.append('type_recurring', type_recurring);
                    formData.append('type_precognitive', type_precognitive);
                    formData.append('type_OBE', type_OBE);
                    formData.append('submit', '保存梦');

                    // 发送 POST 请求
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', 'http://yume.ly/dream/create');
                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            var finalUrl = xhr.responseURL;
                            // 跳转提示
                            var jumpdialog = document.createElement("mdui-dialog");
                            jumpdialog.setAttribute("close-on-overlay-click", "");
                            jumpdialog.setAttribute("headline", "TvT造梦成功,是否跳转?");
                            jumpdialog.classList.add("jump");

                            // 添加取消按钮
                            var cancelBtn = document.createElement("mdui-button");
                            cancelBtn.setAttribute("slot", "action");
                            cancelBtn.setAttribute("variant", "text");
                            cancelBtn.textContent = "取消";

                            // 添加跳转按钮
                            var jumpBtn = document.createElement("mdui-button");
                            jumpBtn.setAttribute("slot", "action");
                            jumpBtn.setAttribute("variant", "tonal");
                            jumpBtn.textContent = "跳转";

                            // 将按钮添加到对话框中
                            jumpdialog.appendChild(cancelBtn);
                            jumpdialog.appendChild(jumpBtn);

                            // 添加点击事件监听器
                            cancelBtn.addEventListener("click", () => { jumpdialog.open = false; });
                            jumpBtn.addEventListener("click", () => { window.location.assign(finalUrl); });
                            // 在页面添加<mdui-dialog>
                            document.body.appendChild(jumpdialog);
                            jumpdialog.setAttribute('open', true);
                        } else {
                            console.log('请求失败');
                        }
                    };
                    xhr.send(formData);

                } else {
                    var dialog = document.querySelector('.check');
                    dialog.setAttribute('open', true)
                }
            });
        } else {
            console.log("This is not the create dream page.");
        }
    }

    // 仅自己图标优化
    async function optLock() {
        // 替换所有符合条件的图片
        document.querySelectorAll('img[alt="仅自己可见"]').forEach(function (img) {
            // 创建一个新的 mdui-icon 元素
            var mduiIcon = document.createElement('mdui-icon');
            mduiIcon.setAttribute('name', 'lock--two-tone');
            mduiIcon.style.position = 'absolute'; // 设置绝对定位
            mduiIcon.style.top = '50%'; // 垂直居中
            mduiIcon.style.right = '30px'; // 右侧对齐
            mduiIcon.style.transform = 'translateY(-50%)'; // 垂直居中偏移

            // 将新元素插入到 h2 元素的末尾
            var h2 = img.closest('h2'); // 找到最近的 h2 父元素
            h2.style.position = 'relative'; // 确保 h2 元素有定位上下文
            h2.appendChild(mduiIcon);

            // 删除原来的 img 元素
            img.parentNode.removeChild(img);
        });
    }

    // 世界线优化
    async function optWorldLine() {
        // 获取当前页面的 URL
        var url = new URL(window.location.href);

        // 移除所有的查询参数
        url.search = "";
        if (url.href == 'http://yume.ly/global') {
            // 加载提示
            var loaddialog = document.createElement('mdui-dialog');
            loaddialog.setAttribute('headline', '正在加载请稍等...');
            loaddialog.setAttribute('open', true);
            loaddialog.classList.add('loading');

            // 添加线性进度指示器
            var linear = document.createElement("mdui-linear-progress");

            // 将线性进度指示器添加到对话框中
            loaddialog.appendChild(linear);

            // 在页面添加<mdui-dialog>
            document.body.appendChild(loaddialog);

            // 修改评论区
            function ReComments() {
                // 获取所有带有 loadComments 类名的 a 元素
                var comments = document.querySelectorAll('a.loadComments');

                // 遍历所有的 loadComments 链接
                comments.forEach(comment => {
                    // 添加点击事件监听器
                    comment.addEventListener('click', function (event) {
                        event.preventDefault(); // 阻止默认链接行为

                        // 获取父节点的下一个兄弟节点
                        const nextSibling = this.parentNode.nextElementSibling;

                        // 切换该节点的 display 样式
                        if (nextSibling) {
                            if (nextSibling.style.display === 'none') {
                                nextSibling.style.display = 'block';
                            } else {
                                nextSibling.style.display = 'none';
                            }
                        }
                    });
                });
            }

            var columnHomeA = document.getElementById('columnHomeA');
            if (!columnHomeA) {
                console.error('未找到 id 为 columnHomeA 的元素。');
                return;
            }

            async function fetchData() {
                try {
                    // 调用异步函数获取数据
                    var DreamIds = await getRes(apiUrl);
                    console.log('云端存活梦境获取成功');
                    // 获取页面参数
                    var DreamCount = DreamIds.length;
                    var MaxPage = Math.ceil(DreamCount / 15);
                    var Page = MaxPage - ShowPage + 1;
                    var startNum = (Page - 1) * 15;
                    var endNum = startNum + 15;
                    if (endNum > DreamIds.length) {
                        endNum = DreamIds.length
                    }
                    // 处理数据
                    DreamIds = DreamIds.slice(startNum, endNum);

                    // 添加梦境到页面，并等待添加完成
                    await addDreams(DreamIds);

                    // 刷新栏目
                    ReComments();
                    loaddialog.setAttribute('open', false)
                } catch (error) {
                    console.error('获取云端存活梦境失败', error);
                }
            }

            // 删除除了最后一个子元素之外的所有子元素
            while (columnHomeA.firstChild !== columnHomeA.lastChild) {
                columnHomeA.removeChild(columnHomeA.firstChild);
            }
            fetchData();
        }
    }

    // 页面指示器优化
    async function optPagePoints() {

        function generateNumberList(Page, MaxPage) {
            let list = [];

            // 从当前页码Page开始向右取，直到达到长度为10或超过最大页数MaxPage
            let current = Page;
            while (list.length < 10 && current <= MaxPage) {
                list.push(current);
                current++;
            }

            // 如果不足10个，从最大页码MaxPage向左取，直到达到长度为10
            current = Page - 1;
            while (list.length < 10 && current > 0) {
                list.unshift(current); // 在列表头部插入当前值，实现递减效果
                current--;
            }

            return list;
        }

        // 添加选项
        function addOption(selectElement, page, text = '', icon = '') {
            var mduiBtn = document.createElement('mdui-segmented-button');
            mduiBtn.setAttribute('href', `?page=${page}`)
            mduiBtn.textContent = text;
            // 如果为当前页则粗体
            if (typeof page === 'string') {
                mduiBtn.style.fontWeight = 'bold';
            }
            if (text == '首页') {
                mduiBtn.setAttribute('icon', 'first_page--two-tone')
            }
            if (text == '上一页') {
                mduiBtn.setAttribute('icon', 'keyboard_double_arrow_left--two-tone')
            }
            if (text == '下一页') {
                mduiBtn.setAttribute('end-icon', 'last_page--two-tone')
            }
            if (text == '尾页') {
                mduiBtn.setAttribute('end-icon', 'keyboard_double_arrow_right--two-tone')
            }

            selectElement.appendChild(mduiBtn);
        }

        async function fetchData() {
            try {
                // 调用异步函数获取数据
                var DreamIds = await getRes(apiUrl);
                console.log('云端存活梦境获取成功');
                // 获取页面参数
                var DreamCount = DreamIds.length;
                var MaxPage = Math.ceil(DreamCount / 15);
                var Pages = generateNumberList(ShowPage, MaxPage);
                var pageInner = document.querySelector('div.page_inner');
                var mduiBtnG = document.createElement('mdui-segmented-button-group');
                mduiBtnG.setAttribute('selects', 'single')
                // 判断是否可以跳转到首页
                if (!Pages.includes(1)) {
                    addOption(mduiBtnG, 1, '首页')
                }
                // 判断当前的页数不为首页
                if (ShowPage != 1) {
                    addOption(mduiBtnG, ShowPage - 1, '上一页')
                }
                // 添加中间的页数
                Pages.forEach(page => addOption(mduiBtnG, page, page));
                // 判断当前的页数不为尾页
                if (ShowPage != MaxPage) {
                    addOption(mduiBtnG, ShowPage - 1, '下一页')
                }
                // 判断是否可以跳转到尾页
                if (!Pages.includes(1)) {
                    addOption(mduiBtnG, MaxPage, '尾页')
                }

                pageInner.parentNode.replaceChild(mduiBtnG, pageInner);
            } catch (error) {
                console.error('获取云端存活梦境失败', error);
            }
        }
        fetchData();

    }

    // 用户选项初始化
    function init() {
        if (enableload) {
            load();
        }
        if (enableDisableFormSubmission) {
            disableFormSubmission();
        }

        if (enableAddFAB) {
            addFAB()
        }

        if (enableRemovePanel) {
            removePanel();
        }

        if (enableRemoveTips) {
            removeTips();
        }

        if (enableRemovePanel) {
            removePanel();
        } if (enableOptTags) {
            optTags();
        }

        if (enableOptCreateDream) {
            optCreateDream();
        }
        if (enableOptComments) {
            optComments();
        }

        if (enableOptLock) {
            optLock();
        }
        if (enableOptWorldLine) {
            optWorldLine();
        }
        if (enableOptPagePoints) {
            optPagePoints();
        }
    }

    init();

})();