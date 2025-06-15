const infographics = [
    {
        title: "경기침체기 외식업 트렌드",
        description: "경기침체기에도 성장하는 외식업의 비결을 데이터로 분석합니다.",
        image: "/infographics/recession-restaurant-trends.html",
        category: "시장분석"
    },
    {
        title: "에너지비용 비교 분석",
        description: "가스, 전기, 인덕션의 에너지비용을 상세히 비교합니다.",
        image: "/infographics/energy-cost-comparison.html",
        category: "비용분석"
    },
    {
        title: "인덕션 vs 하이라이트",
        description: "인덕션과 하이라이트의 장단점을 비교 분석합니다.",
        image: "/infographics/induction-vs-highlight.html",
        category: "비용분석"
    },
    {
        title: "외식업 성공 전략 데이터",
        description: "외식업 성공을 위한 핵심 변수와 전략을 데이터로 분석합니다.",
        image: "/infographics/restaurant-success-strategy.html",
        category: "시장분석"
    }
]; 

const Infographics = () => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {infographics.map((item, index) => (
                    <div key={index} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-900">
                            <iframe 
                                src={item.image} 
                                className="w-full h-full"
                            />
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-3 py-1 text-xs font-semibold text-[#FF6600] bg-[#FF6600]/10 rounded-full">
                                    {item.category}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                            <div className="flex justify-center">
                                <a 
                                    href={item.image} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#FF6600] rounded-lg hover:bg-[#FF9933] transition-colors duration-300 shadow-lg hover:shadow-xl"
                                >
                                    자세히 보기
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-8">
                <a 
                    href="/" 
                    className="inline-flex items-center px-6 py-3 bg-[#FF6600] text-white rounded-lg hover:bg-[#FF9933] transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                    <i className="fas fa-arrow-left mr-2"></i>
                    <i className="fas fa-home mr-2"></i>
                    홈으로 돌아가기
                </a>
            </div>
        </div>
    );
};

export default Infographics; 