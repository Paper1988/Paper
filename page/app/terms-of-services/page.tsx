export default function TOS() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="bg-black w-full h-full flex flex-col items-center justify-center gap-8">
                <header className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-sm transform transition-transform duration-300 -translate-y-full peer-[.scrolled]:translate-y-0 z-50">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">DoContrib</h2>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-20">
                    <h1 className="text-4xl font-bold mb-8 text-white">服務條款</h1>
                    
                    <section className="space-y-6 text-white">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">接受條款</h2>
                            <p>
                                使用本服務即表示您同意遵守這些條款。如果您不同意這些條款，請勿使用本服務。
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">服務說明</h2>
                            <p>
                                DoContrib 提供團隊貢獻追蹤和管理服務。我們保留隨時修改、暫停或終止服務的權利。
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">用戶責任</h2>
                            <ul className="list-disc list-inside space-y-2">
                                <li>遵守所有適用的法律和規定</li>
                                <li>維護帳戶安全</li>
                                <li>提供準確的資訊</li>
                                <li>尊重其他用戶的權利</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">智慧財產權</h2>
                            <p>
                                本服務的所有內容和功能均受智慧財產權法保護。未經許可，不得複製、修改或散布。
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">免責聲明</h2>
                            <p>
                                本服務按「現狀」提供，不提供任何明示或暗示的保證。我們不對使用本服務可能造成的損失負責。
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4">條款修改</h2>
                            <p>
                                我們保留隨時修改這些條款的權利。重大變更時，我們會在網站上發布通知。
                            </p>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}