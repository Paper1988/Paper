export default function PrivacyPolicy() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="bg-black w-full h-full flex flex-col items-center justify-center gap-8">
                <header className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-sm transform transition-transform duration-300 -translate-y-full peer-[.scrolled]:translate-y-0 z-50">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">DoContrib</h2>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-20">
                    <h1 className="text-4xl font-bold mb-8 text-white">隱私權政策</h1>
                    
                    <section className="space-y-6 text-white">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">資料收集</h2>
                            <p>
                                我們收集的資訊包括但不限於：
                            </p>
                            <ul className="list-disc list-inside space-y-2 mt-2">
                                <li>基本個人資料（姓名、電子郵件）</li>
                                <li>使用者行為數據</li>
                                <li>系統日誌資訊</li>
                                <li>裝置資訊</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">資料使用</h2>
                            <p>
                                我們使用收集的資訊來：
                            </p>
                            <ul className="list-disc list-inside space-y-2 mt-2">
                                <li>提供並改善我們的服務</li>
                                <li>個人化您的使用體驗</li>
                                <li>與您溝通並回應您的需求</li>
                                <li>分析使用趨勢並優化網站功能</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">資料保護</h2>
                            <p>
                                我們採取適當的技術和組織措施來保護您的個人資料，防止未經授權的存取、使用或披露。
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">第三方服務</h2>
                            <p>
                                我們的服務可能包含第三方服務的連結。這些第三方有其自己的隱私權政策，我們建議您詳閱這些政策。
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">政策更新</h2>
                            <p>
                                我們保留隨時修改本隱私權政策的權利。重大變更時，我們會在網站上發布通知。
                            </p>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}