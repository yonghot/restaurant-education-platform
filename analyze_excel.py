배포import pandas as pd
import os

def analyze_excel_file():
    try:
        # 엑셀 파일 경로
        file_path = 'rawdata/예상 손익계산서_안심닭곰탕 신논현점_250618.xlsx'
        
        # 파일 존재 확인
        if not os.path.exists(file_path):
            print(f"파일을 찾을 수 없습니다: {file_path}")
            return
        
        print(f"파일 분석 시작: {file_path}")
        
        # 엑셀 파일의 모든 시트 읽기
        excel_file = pd.ExcelFile(file_path)
        print(f"시트 목록: {excel_file.sheet_names}")
        
        # 각 시트 분석
        for sheet_name in excel_file.sheet_names:
            print(f"\n=== 시트: {sheet_name} ===")
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            print(f"데이터 형태: {df.shape}")
            print(f"컬럼 목록: {list(df.columns)}")
            
            # 전체 데이터 출력 (결측값 제외)
            print("\n전체 데이터 (결측값 제외):")
            for index, row in df.iterrows():
                # 결측값이 아닌 데이터만 출력
                non_null_data = row.dropna()
                if len(non_null_data) > 0:
                    print(f"행 {index}: {dict(non_null_data)}")
            
            # 숫자 데이터가 있는 행 찾기
            print("\n숫자 데이터가 포함된 행:")
            for index, row in df.iterrows():
                numeric_data = row[pd.to_numeric(row, errors='coerce').notna()]
                if len(numeric_data) > 0:
                    print(f"행 {index}: {dict(numeric_data)}")
            
            print("\n" + "="*50)
    
    except Exception as e:
        print(f"오류 발생: {e}")

if __name__ == "__main__":
    analyze_excel_file() 