import { Lang } from '../i18n/translations'

export interface LegalSection {
  h: string
  p?: string[]
  ul?: string[]
  sub?: { h: string; p?: string[]; ul?: string[] }[]
}
export interface LegalDoc {
  title: string
  updated: string
  intro?: string
  sections: LegalSection[]
  footer: { h?: string; p: string }
  metaDesc: string
}

type Doc = Record<Lang, LegalDoc>

export const terms: Doc = {
  en: {
    title: 'Terms & Conditions',
    updated: 'Last Updated: November 2026',
    metaDesc: 'Terms and conditions for using the free online tools on hexagonprofile.com.',
    sections: [
      { h: '1. Acceptance of Terms', p: ['By accessing and using the tools and services provided on hexagonprofile.com (the "Website"), operated by SONG FINANCE PTY LTD, you accept and agree to be bound by these terms. If you do not agree, please do not use our services.'] },
      { h: '2. Use of Services', p: ['Our tools are provided free of charge for personal and commercial use. You agree to:'], ul: [
        'Use the services in compliance with all applicable laws and regulations',
        'Not attempt to gain unauthorized access to any part of the services',
        'Not use the services to transmit malicious code or harmful content',
        'Not attempt to reverse engineer, decompile, or disassemble any part of the services, except as permitted by the open-source licence',
        'Not use automated systems to access the services in a manner that sends more requests than a human can reasonably produce'] },
      { h: '3. Intellectual Property', p: ['The Website and its original content, features, and functionality are owned by SONG FINANCE PTY LTD and are protected by copyright and other intellectual property laws. Source code released on GitHub is governed by its own licence (MIT). Content you create using our tools remains your property.'] },
      { h: '4. User Content', p: ['You retain all rights to any content you create using our tools. We do not claim ownership of your work. Our tools process data locally in your browser, and we do not store or have access to your content unless explicitly stated otherwise.'] },
      { h: '5. Disclaimer of Warranties', p: ['The services are provided "as is" and "as available" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, or non-infringement. Floor plans created with our tools are for illustration and planning only and are not engineering or construction drawings. We do not warrant that the services will be uninterrupted, secure, or error-free.'] },
      { h: '6. Limitation of Liability', p: ['To the maximum extent permitted by law, SONG FINANCE PTY LTD, its directors, employees, partners, agents, suppliers, or affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of, or inability to access or use, the services.'] },
      { h: '7. Service Availability', p: ['We reserve the right to modify, suspend, or discontinue any part of the services at any time without notice.'] },
      { h: '8. Links to Other Websites', p: ['Our services may contain links to third-party websites (for example GitHub) that we do not own or control. We assume no responsibility for the content, privacy policies, or practices of any third-party websites.'] },
      { h: '9. Changes to Terms', p: ['We may modify these terms at any time. We will update the "Last Updated" date at the top of this page. Your continued use of the services after any changes constitutes acceptance of the new terms.'] },
      { h: '10. Governing Law', p: ['These terms are governed by applicable law. Our failure to enforce any right or provision of these terms is not a waiver of that right.'] },
      { h: '11. Contact Information', p: ['If you have questions about these Terms & Conditions, please contact us through songfinance.com.'] },
    ],
    footer: { p: 'By using our services, you acknowledge that you have read and understood these Terms & Conditions and agree to be bound by them.' },
  },
  zh: {
    title: '服务条款',
    updated: '最后更新：2026 年 11 月',
    metaDesc: '使用 hexagonprofile.com 免费在线工具的服务条款。',
    sections: [
      { h: '1. 条款的接受', p: ['访问和使用由 SONG FINANCE PTY LTD 运营的 hexagonprofile.com（“本网站”）提供的工具和服务，即表示您接受并同意受本条款约束。如不同意，请勿使用我们的服务。'] },
      { h: '2. 服务的使用', p: ['我们的工具免费提供，可用于个人和商业用途。您同意：'], ul: [
        '遵守所有适用的法律法规使用本服务',
        '不尝试未经授权访问服务的任何部分',
        '不利用本服务传播恶意代码或有害内容',
        '除开源许可证允许的范围外，不对服务的任何部分进行逆向工程、反编译或反汇编',
        '不以超出正常人工操作的频率使用自动化系统访问本服务'] },
      { h: '3. 知识产权', p: ['本网站及其原创内容、功能归 SONG FINANCE PTY LTD 所有，受版权及其他知识产权法律保护。发布在 GitHub 上的源代码适用其自身的许可证（MIT）。您使用我们的工具创建的内容仍归您所有。'] },
      { h: '4. 用户内容', p: ['您保留使用我们的工具所创建内容的全部权利，我们不主张对您的作品的所有权。我们的工具在您的浏览器本地处理数据，除非另有明确说明，我们不会存储或访问您的内容。'] },
      { h: '5. 免责声明', p: ['本服务按“现状”和“可用”状态提供，不附带任何明示或默示的保证，包括适销性、特定用途适用性或不侵权。使用我们的工具创建的平面图仅供示意和规划参考，不属于工程或施工图纸。我们不保证服务不会中断、安全或无错误。'] },
      { h: '6. 责任限制', p: ['在法律允许的最大范围内，SONG FINANCE PTY LTD 及其董事、员工、合作伙伴、代理、供应商或关联方，对因您访问或使用（或无法访问或使用）本服务而产生的任何间接、附带、特殊、后果性或惩罚性损失（包括利润、数据、使用、商誉或其他无形损失）不承担责任。'] },
      { h: '7. 服务可用性', p: ['我们保留随时修改、暂停或终止任何部分服务的权利，恕不另行通知。'] },
      { h: '8. 其他网站的链接', p: ['我们的服务可能包含指向第三方网站（如 GitHub）的链接，这些网站不归我们所有或控制。我们对任何第三方网站的内容、隐私政策或做法不承担责任。'] },
      { h: '9. 条款的变更', p: ['我们可能随时修改本条款，并会更新本页顶部的“最后更新”日期。变更后继续使用本服务即表示您接受新条款。'] },
      { h: '10. 适用法律', p: ['本条款受适用法律管辖。我们未行使本条款下的任何权利或规定，不构成对该权利的放弃。'] },
      { h: '11. 联系方式', p: ['如对本服务条款有任何疑问，请通过 songfinance.com 与我们联系。'] },
    ],
    footer: { p: '使用我们的服务即表示您已阅读并理解本服务条款，并同意受其约束。' },
  },
}

export const privacy: Doc = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last Updated: November 2026',
    metaDesc: 'How hexagonprofile.com handles your data: drawings stay in your browser, with only anonymous usage statistics.',
    sections: [
      { h: '1. Introduction', p: ['Hexagon Profile, operated by SONG FINANCE PTY LTD ("we", "our", or "us"), is committed to protecting your privacy. This policy explains how we collect, use, and safeguard information when you visit hexagonprofile.com and use our tools.'] },
      { h: '2. Information We Collect', sub: [
        { h: '2.1 Information You Provide', p: ['Our tools do not require registration or an account, and we do not ask you for personal information to use them.'] },
        { h: '2.2 Automatically Collected Information', p: ['When you visit our website, we may automatically collect limited technical and usage information, such as:'], ul: ['Browser type and version', 'Operating system', 'Anonymised IP address', 'Pages visited and referring website', 'Anonymous tool-usage events (for example "exported a PNG"). These never include the content of your drawings', 'General geographic location (country level)'] },
        { h: '2.3 Local Storage', p: ['Our tools use your browser\'s local storage to autosave your drawing and remember preferences such as your language. This data stays on your device and is not sent to our servers.'] },
      ] },
      { h: '3. How We Use Your Information', p: ['We use the information we collect to:'], ul: ['Provide, operate, and maintain our services', 'Improve and optimize our website and tools', 'Understand which features are used', 'Detect and prevent technical issues and security threats', 'Comply with legal obligations'] },
      { h: '4. Data Processing and Storage', p: ['Our tools process data entirely in your browser (client-side). This means:'], ul: ['Your drawings and files are not uploaded to our servers', 'We do not have access to the content you create', 'Your data remains private and under your control'] },
      { h: '5. Cookies and Similar Technologies', p: ['We may use cookies and similar technologies for essential functions, preferences and anonymous analytics. You can instruct your browser to refuse cookies, although some features may not work as a result.'] },
      { h: '6. Third-Party Services', p: ['We may use third-party providers to host the website and analyse usage. Analytics may include Microsoft Clarity, which records anonymised interaction data such as clicks, scrolling and page heatmaps to help us improve the tools (see the Microsoft privacy statement); the content of your drawings is not sent to us. These providers receive only aggregated or anonymised data and may not use it for other purposes. The Bitbucket Deployment Dashboard is a separate open-source project that you run yourself; this website does not receive your Bitbucket credentials.'] },
      { h: '7. Data Security', p: ['We implement appropriate technical and organisational measures to protect information. No method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.'] },
      { h: '8. Your Privacy Rights', p: ['Depending on where you live, you may have rights regarding your personal information, including:'], ul: ['Access to your personal information', 'Correction of inaccurate information', 'Deletion of your information', 'Objection to processing', 'Data portability', 'Withdrawal of consent'] },
      { h: '9. Children\'s Privacy', p: ['Our services are not directed to children under 13, and we do not knowingly collect personal information from them.'] },
      { h: '10. International Data Transfers', p: ['Information may be processed on servers outside your jurisdiction, where data protection laws may differ. By using our services, you consent to such transfers.'] },
      { h: '11. Changes to This Privacy Policy', p: ['We may update this policy from time to time and will post the new version here with an updated "Last Updated" date.'] },
      { h: '12. Contact Us', p: ['If you have questions about this Privacy Policy, please contact us through songfinance.com.'] },
    ],
    footer: { h: 'Our Privacy Commitment', p: 'We believe in privacy by design. Our tools process your data locally in your browser, so we never see or store your work.' },
  },
  zh: {
    title: '隐私政策',
    updated: '最后更新：2026 年 11 月',
    metaDesc: 'hexagonprofile.com 如何处理您的数据：图纸保存在浏览器本地，仅收集匿名使用统计。',
    sections: [
      { h: '1. 简介', p: ['Hexagon Profile 由 SONG FINANCE PTY LTD（“我们”）运营，致力于保护您的隐私。本政策说明您访问 hexagonprofile.com 并使用我们的工具时，我们如何收集、使用和保护信息。'] },
      { h: '2. 我们收集的信息', sub: [
        { h: '2.1 您提供的信息', p: ['使用我们的工具无需注册或创建账号，我们也不会要求您提供个人信息。'] },
        { h: '2.2 自动收集的信息', p: ['您访问本网站时，我们可能自动收集有限的技术和使用信息，例如：'], ul: ['浏览器类型和版本', '操作系统', '匿名化的 IP 地址', '访问的页面和来源网站', '匿名的工具使用事件（例如“导出了 PNG”），不包含您图纸的内容', '大致地理位置（国家级别）'] },
        { h: '2.3 本地存储', p: ['我们的工具使用浏览器本地存储来自动保存您的图纸并记住语言等偏好。这些数据保留在您的设备上，不会发送到我们的服务器。'] },
      ] },
      { h: '3. 我们如何使用信息', p: ['我们使用收集的信息用于：'], ul: ['提供、运营和维护我们的服务', '改进和优化网站及工具', '了解哪些功能被使用', '检测和预防技术问题与安全威胁', '遵守法律义务'] },
      { h: '4. 数据处理与存储', p: ['我们的工具完全在您的浏览器中处理数据（客户端处理），这意味着：'], ul: ['您的图纸和文件不会上传到我们的服务器', '我们无法访问您创建的内容', '您的数据保持私密并由您掌控'] },
      { h: '5. Cookie 及类似技术', p: ['我们可能使用 Cookie 及类似技术来实现基本功能、保存偏好和进行匿名统计。您可以设置浏览器拒绝 Cookie，但部分功能可能因此无法使用。'] },
      { h: '6. 第三方服务', p: ['我们可能使用第三方服务商托管网站和分析使用情况，我们的统计可能包含 Microsoft Clarity，它会记录点击、滚动和页面热力图等匿名交互数据，用于改进工具（详见微软隐私声明）；您图纸的内容不会发送给我们。这些服务商仅获得汇总或匿名数据，且不得用于其他目的。Bitbucket 部署看板是需要您自行运行的独立开源项目，本网站不会接收您的 Bitbucket 凭据。'] },
      { h: '7. 数据安全', p: ['我们采取适当的技术和组织措施保护信息。但任何互联网传输或电子存储方式都不是 100% 安全的，我们无法保证绝对安全。'] },
      { h: '8. 您的隐私权利', p: ['根据您所在地区的不同，您可能享有以下与个人信息相关的权利：'], ul: ['访问您的个人信息', '更正不准确的信息', '删除您的信息', '反对处理', '数据可携带', '撤回同意'] },
      { h: '9. 儿童隐私', p: ['我们的服务不面向 13 岁以下儿童，也不会故意收集其个人信息。'] },
      { h: '10. 跨境数据传输', p: ['信息可能在您所在司法辖区之外的服务器上处理，当地的数据保护法律可能不同。使用我们的服务即表示您同意此类传输。'] },
      { h: '11. 隐私政策的变更', p: ['我们可能不时更新本政策，并在此页面发布新版本和更新后的“最后更新”日期。'] },
      { h: '12. 联系我们', p: ['如对本隐私政策有任何疑问，请通过 songfinance.com 与我们联系。'] },
    ],
    footer: { h: '我们的隐私承诺', p: '我们奉行“隐私优先”的设计理念。我们的工具在您的浏览器本地处理数据，因此我们不会看到或存储您的作品。' },
  },
}
