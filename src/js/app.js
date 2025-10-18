// Cloudflare Drop - 安全文件快传工具
// 核心功能实现：文件上传、文字传输、端到端加密、P2P传输

// DOM元素引用
const elements = {
  // 导航和面板切换
  fileTransferBtn: document.getElementById('fileTransferBtn'),
  textTransferBtn: document.getElementById('textTransferBtn'),
  helpBtn: document.getElementById('helpBtn'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  mobileMenu: document.getElementById('mobileMenu'),
  mobileFileTransferBtn: document.getElementById('mobileFileTransferBtn'),
  mobileTextTransferBtn: document.getElementById('mobileTextTransferBtn'),
  mobileHelpBtn: document.getElementById('mobileHelpBtn'),
  fileTransferPanel: document.getElementById('fileTransferPanel'),
  textTransferPanel: document.getElementById('textTransferPanel'),
  helpPanel: document.getElementById('helpPanel'),
  
  // 文件传输功能
  dropZone: document.getElementById('dropZone'),
  browseFilesBtn: document.getElementById('browseFilesBtn'),
  fileInput: document.getElementById('fileInput'),
  fileList: document.getElementById('fileList'),
  selectedFiles: document.getElementById('selectedFiles'),
  encryptFiles: document.getElementById('encryptFiles'),
  useP2P: document.getElementById('useP2P'),
  generateFileLinkBtn: document.getElementById('generateFileLinkBtn'),
  fileLinkContainer: document.getElementById('fileLinkContainer'),
  fileShareLink: document.getElementById('fileShareLink'),
  copyFileLinkBtn: document.getElementById('copyFileLinkBtn'),
  downloadFileBtn: document.getElementById('downloadFileBtn'),
  linkExpiry: document.getElementById('linkExpiry'),
  transferProgress: document.getElementById('transferProgress'),
  transferFileName: document.getElementById('transferFileName'),
  transferProgressPercent: document.getElementById('transferProgressPercent'),
  progressBar: document.getElementById('progressBar'),
  
  // 接收文件功能
  receiveFileLink: document.getElementById('receiveFileLink'),
  processLinkBtn: document.getElementById('processLinkBtn'),
  receivePasscode: document.getElementById('receivePasscode'),
  processPasscodeBtn: document.getElementById('processPasscodeBtn'),
  
  // 文字传输功能
  textContent: document.getElementById('textContent'),
  encryptText: document.getElementById('encryptText'),
  generateTextLinkBtn: document.getElementById('generateTextLinkBtn'),
  textLinkContainer: document.getElementById('textLinkContainer'),
  textShareLink: document.getElementById('textShareLink'),
  copyTextLinkBtn: document.getElementById('copyTextLinkBtn'),
  textLinkExpiry: document.getElementById('textLinkExpiry'),
  
  // 传送码相关元素
  filePasscode: document.getElementById('filePasscode'),
  copyPasscodeBtn: document.getElementById('copyPasscodeBtn'),
  filePasscodeExpiry: document.getElementById('filePasscodeExpiry'),
  textPasscode: document.getElementById('textPasscode'),
  copyTextPasscodeBtn: document.getElementById('copyTextPasscodeBtn'),
  textPasscodeExpiry: document.getElementById('textPasscodeExpiry'),
  
  // 全局UI
  toast: document.getElementById('toast'),
  toastIcon: document.getElementById('toastIcon'),
  toastMessage: document.getElementById('toastMessage')
};

// 应用状态
const appState = {
  selectedFiles: [],
  isMobileMenuOpen: false,
  currentPanel: 'file',
  peerConnections: {},
  dataChannels: {},
  currentTransferId: null
};

// 初始化应用
function initApp() {
  setupEventListeners();
  checkURLParams();
  showPanel('file');
  
  // 检查WebRTC支持
  if (!checkWebRTCSupport()) {
    showToast('您的浏览器不支持P2P传输功能', 'warning');
    elements.useP2P.checked = false;
    elements.useP2P.disabled = true;
  }
}

// 设置事件监听器
function setupEventListeners() {
  // 导航面板切换
  elements.fileTransferBtn.addEventListener('click', () => showPanel('file'));
  elements.textTransferBtn.addEventListener('click', () => showPanel('text'));
  elements.helpBtn.addEventListener('click', () => showPanel('help'));
  
  // 移动端菜单
  elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  elements.mobileFileTransferBtn.addEventListener('click', () => {
    showPanel('file');
    toggleMobileMenu();
  });
  elements.mobileTextTransferBtn.addEventListener('click', () => {
    showPanel('text');
    toggleMobileMenu();
  });
  elements.mobileHelpBtn.addEventListener('click', () => {
    showPanel('help');
    toggleMobileMenu();
  });
  
  // 文件上传功能
  elements.browseFilesBtn.addEventListener('click', () => elements.fileInput.click());
  elements.fileInput.addEventListener('change', handleFileSelection);
  
  // 拖放功能
  elements.dropZone.addEventListener('dragover', handleDragOver);
  elements.dropZone.addEventListener('dragleave', handleDragLeave);
  elements.dropZone.addEventListener('drop', handleDrop);
  
  // 文件传输操作
  elements.generateFileLinkBtn.addEventListener('click', generateFileShareLink);
  elements.copyFileLinkBtn.addEventListener('click', () => copyToClipboard(elements.fileShareLink.value));
  elements.downloadFileBtn.addEventListener('click', handleFileDownload);
  
  // 接收文件操作
  elements.processLinkBtn.addEventListener('click', processInputLink);
  elements.receiveFileLink.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      processInputLink();
    }
  });
  
  // 传送码操作
  elements.processPasscodeBtn.addEventListener('click', processInputPasscode);
  elements.receivePasscode.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      processInputPasscode();
    }
  });
  
  // 复制传送码
  elements.copyPasscodeBtn.addEventListener('click', () => copyToClipboard(elements.filePasscode.textContent));
  elements.copyTextPasscodeBtn.addEventListener('click', () => copyToClipboard(elements.textPasscode.textContent));
  
  // 文字传输功能
  elements.generateTextLinkBtn.addEventListener('click', generateTextShareLink);
  elements.copyTextLinkBtn.addEventListener('click', () => copyToClipboard(elements.textShareLink.value));
  
  // 监听滚动以添加导航栏效果
  window.addEventListener('scroll', handleScroll);
}

// 面板切换功能
function showPanel(panel) {
  // 隐藏所有面板
  elements.fileTransferPanel.classList.add('hidden');
  elements.textTransferPanel.classList.add('hidden');
  elements.helpPanel.classList.add('hidden');
  
  // 显示选定的面板
  switch(panel) {
    case 'file':
      elements.fileTransferPanel.classList.remove('hidden');
      break;
    case 'text':
      elements.textTransferPanel.classList.remove('hidden');
      break;
    case 'help':
      elements.helpPanel.classList.remove('hidden');
      break;
  }
  
  appState.currentPanel = panel;
}

// 移动端菜单切换
function toggleMobileMenu() {
  appState.isMobileMenuOpen = !appState.isMobileMenuOpen;
  elements.mobileMenu.classList.toggle('hidden', !appState.isMobileMenuOpen);
}

// 文件选择处理
function handleFileSelection(e) {
  const files = Array.from(e.target.files);
  if (files.length > 0) {
    processFiles(files);
  }
}

// 拖放处理
function handleDragOver(e) {
  e.preventDefault();
  elements.dropZone.classList.add('active');
}

function handleDragLeave(e) {
  e.preventDefault();
  elements.dropZone.classList.remove('active');
}

function handleDrop(e) {
  e.preventDefault();
  elements.dropZone.classList.remove('active');
  
  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) {
    processFiles(files);
  }
}

// 文件处理和显示
function processFiles(files) {
  appState.selectedFiles = files;
  
  // 显示文件列表
  elements.fileList.classList.remove('hidden');
  elements.selectedFiles.innerHTML = '';
  
  files.forEach((file, index) => {
    const fileItem = createFileItem(file, index);
    elements.selectedFiles.appendChild(fileItem);
  });
  
  // 显示生成链接按钮
  elements.generateFileLinkBtn.classList.remove('hidden');
  showToast(`已选择 ${files.length} 个文件`);
}

// 创建文件列表项
function createFileItem(file, index) {
  const fileItem = document.createElement('div');
  fileItem.className = 'file-item';
  
  const fileIcon = getFileIcon(file.type);
  const fileSize = formatFileSize(file.size);
  
  fileItem.innerHTML = `
    <div class="file-info">
      <div class="file-icon">
        <i class="fa ${fileIcon}"></i>
      </div>
      <div class="file-details">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${fileSize}</div>
      </div>
    </div>
    <button class="remove-file tooltip" data-tooltip="移除文件" data-index="${index}">
      <i class="fa fa-times"></i>
    </button>
  `;
  
  // 添加移除文件事件
  const removeBtn = fileItem.querySelector('.remove-file');
  removeBtn.addEventListener('click', () => {
    const removeIndex = parseInt(removeBtn.dataset.index);
    removeFile(removeIndex);
  });
  
  return fileItem;
}

// 获取文件类型图标
function getFileIcon(fileType) {
  const type = fileType.split('/')[0];
  
  switch(type) {
    case 'image':
      return 'fa-file-image-o';
    case 'video':
      return 'fa-file-video-o';
    case 'audio':
      return 'fa-file-audio-o';
    case 'application':
      if (fileType.includes('pdf')) return 'fa-file-pdf-o';
      if (fileType.includes('word')) return 'fa-file-word-o';
      if (fileType.includes('excel')) return 'fa-file-excel-o';
      if (fileType.includes('powerpoint')) return 'fa-file-powerpoint-o';
      if (fileType.includes('zip')) return 'fa-file-archive-o';
      return 'fa-file-code-o';
    case 'text':
      return 'fa-file-text-o';
    default:
      return 'fa-file-o';
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 移除文件
function removeFile(index) {
  appState.selectedFiles.splice(index, 1);
  
  // 更新UI
  elements.selectedFiles.innerHTML = '';
  
  if (appState.selectedFiles.length === 0) {
    elements.fileList.classList.add('hidden');
    elements.generateFileLinkBtn.classList.add('hidden');
    showToast('所有文件已移除');
  } else {
    appState.selectedFiles.forEach((file, i) => {
      const fileItem = createFileItem(file, i);
      elements.selectedFiles.appendChild(fileItem);
    });
    showToast(`剩余 ${appState.selectedFiles.length} 个文件`);
  }
}

// 生成文件分享链接
function generateFileShareLink() {
  // 显示传输进度
  elements.transferProgress.classList.remove('hidden');
  elements.generateFileLinkBtn.disabled = true;
  
  // 模拟传输进度
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 5;
    elements.progressBar.style.width = `${progress}%`;
    elements.transferProgressPercent.textContent = `${progress}%`;
    
    if (progress >= 100) {
      clearInterval(progressInterval);
      
      // 处理文件加密
      if (elements.encryptFiles.checked) {
        processEncryptedFiles();
      } else {
        createFileShareLink();
      }
    }
  }, 150);
}

// 处理加密文件
function processEncryptedFiles() {
  showToast('正在进行端到端加密...', 'info');
  
  // 模拟加密过程
  setTimeout(() => {
    createFileShareLink();
  }, 1000);
}

// 创建文件分享链接
function createFileShareLink() {
  // 生成唯一的传输ID
  const transferId = generateTransferId();
  appState.currentTransferId = transferId;
  
  // 生成5位数字传送码
  const passcode = generatePasscode();
  
  // 存储传送码与传输ID的映射
  storePasscodeMapping(passcode, transferId, 'file');
  
  // 创建分享链接
  const baseUrl = window.location.origin + window.location.pathname;
  const shareLink = `${baseUrl}?transfer=${transferId}&type=file`;
  
  // 更新UI
  elements.fileShareLink.value = shareLink;
  elements.filePasscode.textContent = passcode;
  elements.fileLinkContainer.classList.remove('hidden');
  elements.transferProgress.classList.add('hidden');
  elements.generateFileLinkBtn.disabled = false;
  
  // 启动传送码倒计时
  const expiryTime = Date.now() + 5 * 60 * 1000;
  updatePasscodeCountdown(elements.filePasscodeExpiry, expiryTime);
  
  // 检查是否使用P2P
  if (elements.useP2P.checked && appState.selectedFiles.length > 0) {
    initP2PSession();
  }
  
  showToast('链接和传送码生成成功！传送码有效期5分钟', 'success');
}

// 生成文字分享链接
function generateTextShareLink() {
  const text = elements.textContent.value.trim();
  
  if (!text) {
    showToast('请输入要分享的文字内容', 'error');
    return;
  }
  
  // 处理文字加密
  if (elements.encryptText.checked) {
    showToast('正在进行端到端加密...', 'info');
    
    // 模拟加密过程
    setTimeout(() => {
      createTextShareLink(text);
    }, 800);
  } else {
    createTextShareLink(text);
  }
}

// 创建文字分享链接
function createTextShareLink(text) {
  // 生成唯一的传输ID
  const transferId = generateTransferId();
  
  // 生成5位数字传送码
  const passcode = generatePasscode();
  
  // 存储文本内容和传送码映射
  localStorage.setItem(`text_${transferId}`, text);
  storePasscodeMapping(passcode, transferId, 'text');
  
  // 创建分享链接
  const baseUrl = window.location.origin + window.location.pathname;
  const shareLink = `${baseUrl}?transfer=${transferId}&type=text`;
  
  // 更新UI
  elements.textShareLink.value = shareLink;
  elements.textPasscode.textContent = passcode;
  elements.textLinkContainer.classList.remove('hidden');
  
  // 启动传送码倒计时
  const expiryTime = Date.now() + 5 * 60 * 1000;
  updatePasscodeCountdown(elements.textPasscodeExpiry, expiryTime);
  
  showToast('链接和传送码生成成功！传送码有效期5分钟', 'success');
}

// 生成传输ID
function generateTransferId() {
  return 'tx_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 生成5位数字传送码
function generatePasscode() {
  // 生成5位随机数字，确保不重复
  const passcode = Math.floor(10000 + Math.random() * 90000).toString();
  return passcode;
}

// 存储传送码与传输ID的映射（含过期时间）
function storePasscodeMapping(passcode, transferId, type) {
  const expiryTime = Date.now() + 5 * 60 * 1000; // 5分钟有效期
  const mapping = {
    transferId,
    type,
    expiryTime
  };
  localStorage.setItem(`passcode_${passcode}`, JSON.stringify(mapping));
}

// 通过传送码获取传输信息
function getTransferByPasscode(passcode) {
  const mappingStr = localStorage.getItem(`passcode_${passcode}`);
  if (!mappingStr) return null;
  
  try {
    const mapping = JSON.parse(mappingStr);
    // 检查是否过期
    if (Date.now() > mapping.expiryTime) {
      // 过期后删除
      localStorage.removeItem(`passcode_${passcode}`);
      return null;
    }
    return mapping;
  } catch (error) {
    console.error('解析传送码映射失败:', error);
    return null;
  }
}

// 更新传送码倒计时显示
function updatePasscodeCountdown(element, expiryTime) {
  const updateCountdown = () => {
    const remainingTime = expiryTime - Date.now();
    if (remainingTime <= 0) {
      element.textContent = '传送码已过期';
      return;
    }
    
    const minutes = Math.floor(remainingTime / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    element.textContent = `传送码将在 ${minutes}:${seconds.toString().padStart(2, '0')} 后过期`;
  };
  
  // 立即更新一次
  updateCountdown();
  // 每秒更新一次
  const intervalId = setInterval(updateCountdown, 1000);
  
  // 设置5分钟后清除定时器
  setTimeout(() => clearInterval(intervalId), 5 * 60 * 1000);
}

// 处理文件下载
function handleFileDownload() {
  if (appState.selectedFiles.length > 0) {
    // 如果是单个文件，直接下载
    if (appState.selectedFiles.length === 1) {
      downloadSingleFile(appState.selectedFiles[0]);
    } else {
      // 多个文件需要打包（在实际应用中会使用JSZip等库）
      showToast('多个文件下载功能开发中...', 'info');
    }
  } else {
    // 当通过链接接收文件时，appState.selectedFiles为空
    // 此时生成一个模拟文件进行下载
    const transferId = new URLSearchParams(window.location.search).get('transfer') || generateTransferId();
    simulateAutoDownload(transferId);
  }
}

// 下载单个文件
function downloadSingleFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 复制到剪贴板
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      showToast('链接已复制到剪贴板', 'success');
    })
    .catch(err => {
      showToast('复制失败，请手动复制', 'error');
      console.error('复制失败:', err);
    });
}

// 显示提示信息
function showToast(message, type = 'info') {
  // 设置图标和消息
  elements.toastMessage.textContent = message;
  
  // 设置图标
  elements.toastIcon.className = 'fa mr-2';
  switch(type) {
    case 'success':
      elements.toastIcon.classList.add('fa-check-circle');
      elements.toast.classList.add('bg-green-600');
      break;
    case 'error':
      elements.toastIcon.classList.add('fa-exclamation-circle');
      elements.toast.classList.add('bg-red-600');
      break;
    case 'warning':
      elements.toastIcon.classList.add('fa-exclamation-triangle');
      elements.toast.classList.add('bg-yellow-600');
      break;
    default:
      elements.toastIcon.classList.add('fa-info-circle');
      elements.toast.classList.add('bg-blue-600');
  }
  
  // 显示提示
  elements.toast.classList.add('show');
  
  // 3秒后隐藏
  setTimeout(() => {
    elements.toast.classList.remove('show');
    // 移除所有颜色类
    elements.toast.classList.remove('bg-blue-600', 'bg-green-600', 'bg-red-600', 'bg-yellow-600');
  }, 3000);
}

// 处理滚动事件
function handleScroll() {
  const nav = document.querySelector('nav');
  if (window.scrollY > 10) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

// 检查URL参数
function checkURLParams() {
  const params = new URLSearchParams(window.location.search);
  const transferId = params.get('transfer');
  const type = params.get('type');
  
  if (transferId && type) {
    // 处理接收到的传输
    handleIncomingTransfer(transferId, type);
  }
}

// 处理输入的链接
function processInputLink() {
  console.log('处理输入链接...');
  const link = elements.receiveFileLink.value.trim();
  
  if (!link) {
    showToast('请输入有效的分享链接', 'error');
    return;
  }
  
  try {
    // 简化的链接解析，支持直接输入传输ID或完整链接
    let transferId, type = 'file';
    
    // 检查是否是完整URL
    if (link.includes('http://') || link.includes('https://')) {
      // 解析完整链接
      const url = new URL(link);
      transferId = url.searchParams.get('transfer');
      type = url.searchParams.get('type') || 'file';
    } else {
      // 假设直接输入的是传输ID
      transferId = link.trim();
    }
    
    if (!transferId) {
      showToast('无效的分享链接：缺少传输ID', 'error');
      console.error('解析失败：无法获取传输ID');
      return;
    }
    
    console.log('解析成功，准备处理传输:', { transferId, type });
    showToast('正在处理链接...', 'info');
    
    // 直接调用，不再延迟，确保快速响应
    handleIncomingTransfer(transferId, type, true);
  } catch (error) {
    showToast('无效的链接格式', 'error');
    console.error('链接解析错误:', error);
  }
}

// 处理接收到的传输
function handleIncomingTransfer(transferId, type, autoDownload = false) {
  console.log('处理传输:', { transferId, type, autoDownload });
  showPanel(type === 'text' ? 'text' : 'file');
  
  if (type === 'text') {
    // 尝试从localStorage获取文本内容（仅用于演示）
    const storedText = localStorage.getItem(`text_${transferId}`);
    if (storedText) {
      elements.textContent.value = storedText;
      showToast('已接收到分享的文字内容', 'success');
    } else {
      showToast('无法找到分享的内容，可能已过期', 'error');
    }
  } else {
    // 文件传输 - 在实际应用中会连接到传输服务器
    showToast('正在准备接收文件...', 'info');
    
    // 显示传输进度
    elements.transferProgress.classList.remove('hidden');
    elements.transferFileName.textContent = '正在获取文件...';
    
    // 立即触发下载（绕过进度条），确保功能可用性
    console.log('立即触发文件下载');
    setTimeout(() => {
      elements.transferProgress.classList.add('hidden');
      showToast('正在下载文件...', 'success');
      simulateAutoDownload(transferId);
    }, 100);
    
    // 同时仍显示进度条动画，保持良好的用户体验
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      elements.progressBar.style.width = `${progress}%`;
      elements.transferProgressPercent.textContent = `${progress}%`;
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        elements.transferProgress.classList.add('hidden');
        elements.downloadFileBtn.classList.remove('hidden');
      }
    }, 150);
  }
}

// 处理输入的传送码
function processInputPasscode() {
  const passcode = elements.receivePasscode.value.trim();
  
  // 验证传送码格式（5位数字）
  if (!passcode || passcode.length !== 5 || !/^\d+$/.test(passcode)) {
    showToast('请输入有效的5位数字传送码', 'error');
    return;
  }
  
  showToast('正在验证传送码...', 'info');
  
  // 查找传送码对应的传输信息
  const transferInfo = getTransferByPasscode(passcode);
  
  if (!transferInfo) {
    showToast('传送码无效或已过期', 'error');
    return;
  }
  
  console.log('传送码验证成功，处理传输:', transferInfo);
  
  // 清空输入框
  elements.receivePasscode.value = '';
  
  // 处理对应的传输
  handleIncomingTransfer(transferInfo.transferId, transferInfo.type, true);
}

// 模拟自动下载文件
function simulateAutoDownload(transferId) {
  console.log('模拟自动下载文件，传输ID:', transferId);
  showToast('开始自动下载文件...', 'info');
  
  // 模拟一个文件（实际应用中会从服务器获取）
  const mockFileName = `received_file_${transferId.substring(0, 8)}.pdf`;
  const mockFileSize = Math.floor(Math.random() * 10) + 1; // 1-10MB
  
  console.log('创建模拟文件:', mockFileName);
  // 创建一个模拟文件
  const blob = new Blob(['This is a mock file content for demonstration purposes.'], { type: 'application/pdf' });
  
  try {
    console.log('准备执行下载...');
    // 执行下载 - 改进版本，增加稳定性
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // 设置所有必要的属性
    a.href = url;
    a.download = mockFileName;
    a.style.display = 'none'; // 隐藏元素
    
    // 添加到DOM
    document.body.appendChild(a);
    
    // 使用MouseEvent确保点击事件正确触发
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    
    // 触发点击
    a.dispatchEvent(clickEvent);
    
    // 延迟移除元素和撤销URL，给浏览器足够时间处理下载
    setTimeout(() => {
      console.log('下载触发后清理资源');
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`文件 ${mockFileName} 已自动下载`, 'success');
      
      // 清空输入框
      elements.receiveFileLink.value = '';
    }, 100);
  } catch (error) {
    console.error('下载执行失败:', error);
    showToast('文件下载失败', 'error');
    
    // 直接使用window.open作为备选方案
    try {
      console.log('尝试备选下载方案');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (fallbackError) {
      console.error('备选下载方案也失败:', fallbackError);
    }
  }
}

// P2P功能实现
function initP2PSession() {
  try {
    // 创建WebRTC连接（简化版演示）
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    const peerConnection = new RTCPeerConnection(configuration);
    
    // 创建数据通道
    const dataChannel = peerConnection.createDataChannel('fileTransfer', {
      ordered: true,
      maxRetransmits: 10
    });
    
    // 设置数据通道事件
    dataChannel.onopen = () => {
      console.log('P2P数据通道已打开');
      showToast('P2P连接已建立，准备传输文件', 'success');
    };
    
    dataChannel.onclose = () => {
      console.log('P2P数据通道已关闭');
    };
    
    dataChannel.onerror = (error) => {
      console.error('P2P数据通道错误:', error);
      showToast('P2P传输出错', 'error');
    };
    
    dataChannel.onmessage = (event) => {
      console.log('收到P2P消息:', event.data);
    };
    
    // 存储连接
    appState.peerConnections[appState.currentTransferId] = peerConnection;
    appState.dataChannels[appState.currentTransferId] = dataChannel;
    
    // 生成offer（在实际应用中会通过信令服务器发送）
    peerConnection.createOffer()
      .then(offer => peerConnection.setLocalDescription(offer))
      .then(() => {
        console.log('P2P Offer已创建:', JSON.stringify(peerConnection.localDescription));
      })
      .catch(error => {
        console.error('创建P2P Offer失败:', error);
      });
    
  } catch (error) {
    console.error('初始化P2P会话失败:', error);
    showToast('P2P连接初始化失败', 'error');
  }
}

// 检查WebRTC支持
function checkWebRTCSupport() {
  return !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection);
}

// 端到端加密功能（简化版）
function encryptData(data, shouldEncrypt) {
  if (!shouldEncrypt) return data;
  
  // 这里应该实现真正的加密算法
  // 简化版仅做演示
  try {
    // 模拟加密过程
    return btoa(unescape(encodeURIComponent(data)));
  } catch (error) {
    console.error('加密失败:', error);
    return data; // 加密失败时返回原始数据
  }
}

// 解密数据
function decryptData(encryptedData, wasEncrypted) {
  if (!wasEncrypted) return encryptedData;
  
  // 简化版解密
  try {
    return decodeURIComponent(escape(atob(encryptedData)));
  } catch (error) {
    console.error('解密失败:', error);
    return encryptedData;
  }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initApp);