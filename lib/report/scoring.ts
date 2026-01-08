export type ScorePiece = {
    score: number | null;
    missing?: string[];
    note?: string;
};

function clamp01 (x: number) {
    return Math.max(0,Math.min(1,x));
}

export function productTypeScore(productType: string | null | undefined): ScorePiece {
    const pt = (productType ?? "").toLowerCase().trim();

    if(!pt) return {score: null, missing: ["product_type"]};

    //made simple w safe defaults
    if(pt.includes("web")) return {score: 0.8, note: "Web MVPs usually iterate faster"}
    if(pt.includes("mobile")) return {score: 0.6, note: "Mobiel has to deal with App Store Approval"}
    if(pt.includes("both")) return {score: 0.35, note: "both increases the development workload"}

    //unknown
    return {score: 0.5, note: "Unkwon product type using netural score"}
}

// Here later include where it estimates the MVP costs 