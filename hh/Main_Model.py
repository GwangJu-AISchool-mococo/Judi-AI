from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np
import json
import sys
import re
from sqlalchemy import create_engine

def chatbot(api_key, request):
    client = OpenAI(api_key=api_key,)

    chat = client.chat.completions.create(model='gpt-4-1106-preview', messages=request)
    reply = chat.choices[0].message.content

    return reply

def casename_find(sentence):

    casename = ''
    if '강제추행' in sentence[-100:]:
        casename = '강제추행'
    elif '공무집행방해' in sentence[-100:]:
        casename = '공무집행방해'
    elif '교통사고처리특례법위반(치상)' in sentence[-100:]:
        casename = '교통사고처리특례법위반(치상)'
    elif '도로교통법위반(음주운전)' in sentence[-100:]:
        casename = '도로교통법위반(음주운전)'
    elif '사기' in sentence[-100:]:
        casename = '사기'
    elif '상해' in sentence[-100:]:
        casename = '상해'
    elif '폭행' in sentence[-100:]:
        casename = '폭행'
    
    return casename


def get_similar_sentences(api_key, file_path, input_sentence, threshold=0.7, engine='text-embedding-ada-002'):
    # API 키 설정
    client = OpenAI(api_key=api_key)

    # 데이터 불러오기(데이터베이스에서)
    conn = create_engine('mysql+pymysql://judiai:mococo00.@localhost/mococodb')
    query = 'SELECT * FROM mococodb.data'
    data = pd.read_sql_query(query, conn)
    array = np.load(file_path +'embedding.npy')

    # 입력 문장의 임베딩 계산
    input_sentence_embed = client.embeddings.create(input=input_sentence, model=engine).data[0].embedding
    input_fin = np.array(input_sentence_embed)

    # 유사도 계산
    similarities = np.dot(array, input_fin) / (np.sqrt((array**2).sum(axis=-1)) * np.sqrt((input_fin**2).sum()))
        
    # 유사도가 threshold 이상인 모든 인덱스 찾기
    similar_indexes = np.where(similarities >= threshold)[0]

    # 유사도와 인덱스 쌍을 반환
    similar_sentences_sorted = sorted([(index, similarities[index]) for index in similar_indexes], key=lambda x: x[1], reverse=True)

    # 결과를 데이터 프레임으로 변환
    result_df = pd.DataFrame([data.iloc[i[0]][["casename", "facts", "ruling"]].to_dict() for i in similar_sentences_sorted])

    return result_df

def result_statistics(sentences):

    징역 = {'실형':{}, '집행유예':{}, '선고유예':{}}
    금고 = {'실형':{}, '집행유예':{}, '선고유예':{}}
    벌금 = {}
    사회봉사 = {}
    성폭력_치료프로그램 = {}
    피고인_정보공개 = {}
    아동_청소년_장애인복지시설_취업제한 = {}
    준법운전강의 = {}
    보호관찰 = {}

    for text in sentences:
        text = re.sub(r'\d\.', '', text)

        pattern1 = r'징역 ?(.*[년월]).*[정처 ]한다.*집행.*유예'
        pattern2 = r'징역 ?(.*[년월]).*[정처 ]한다.*선고.*유예'
        pattern3 = r'징역 ?(.*[년월]).*[정처 ]한다'
        if re.search(pattern1, text):
            if re.search(pattern1, text).group(1).replace(' 징역','').replace('개','') in 징역['집행유예']:
                징역['집행유예'][re.search(pattern1, text).group(1).replace(' 징역','').replace('개','')] += 1
            else:
                징역['집행유예'][re.search(pattern1, text).group(1).replace(' 징역','').replace('개','')] = 1

        elif re.search(pattern2, text):
            if re.search(pattern2, text).group(1).replace(' 징역','').replace('개','') in 징역['선고유예']:
                징역['선고유예'][re.search(pattern2, text).group(1).replace(' 징역','').replace('개','')] += 1
            else:
                징역['선고유예'][re.search(pattern2, text).group(1).replace(' 징역','').replace('개','')] = 1

        elif re.search(pattern3, text):
            if re.search(pattern3, text).group(1).replace(' 징역','').replace('개','') in 징역['실형']:
                징역['실형'][re.search(pattern3, text).group(1).replace(' 징역','').replace('개','')] += 1
            else:
                징역['실형'][re.search(pattern3, text).group(1).replace(' 징역','').replace('개','')] = 1

        pattern = r'금고 ?(.*[년월]).*[정처 ]한다'
        if re.search(pattern, text) and '금고' in text:
            if re.search(r'집행.*유예', text):
                if re.search(pattern, text).group(1) in 금고['집행유예']:
                    금고['집행유예'][re.search(pattern, text).group(1).replace(' 징역','').replace('개','')] += 1
                else:
                    금고['집행유예'][re.search(pattern, text).group(1).replace(' 징역','').replace('개','')] = 1

            elif re.search(r'선고.*유예', text):
                if re.search(pattern, text) in 금고:
                    금고['선고유예'][re.search(pattern, text).group(1).replace(' 징역','').replace('개','')] += 1
                else:
                    금고['선고유예'][re.search(pattern, text).group(1).replace(' 징역','').replace('개','')] = 1

            else:
                if re.search(pattern, text) in 금고:
                    금고['실형'][re.search(pattern, text).group(1).replace(' 징역','').replace('개','')] += 1
                else:
                    금고['실형'][re.search(pattern, text).group(1).replace(' 징역','').replace('개','')] = 1

        if '벌금' in text:
            pattern = r'벌금 (.*)에 처한다'
            if bool(re.search(pattern, text)):
                money = re.search(pattern, text).group(1).replace(',','').replace(' ','').replace('(백만)','')

                if '만원' in money:

                    if money in 벌금:
                        벌금[money] += 1
                    else:
                        벌금[money] = 1
                else:
                    money = str(int(int(money[:-1])/10000))+'만원'
                    if money in 벌금:
                        벌금[money] += 1
                    else:
                        벌금[money] = 1


        if '보호관찰' in text:
              if '전체' in 보호관찰:
                  보호관찰['전체'] += 1
              else:
                  보호관찰['전체'] = 1

        if '사회봉사' in text:
            pattern = r'(\d+시간)의 사회봉사'
            if bool(re.search(pattern, text)):
                if re.search(pattern, text).group(1) in 사회봉사:
                    사회봉사[re.search(pattern, text).group(1)] += 1
                else:
                    사회봉사[re.search(pattern, text).group(1)] = 1

        if '성폭력' in text:
            pattern = r'(\d+시간)의 성폭력'
            if bool(re.search(pattern, text)):
                if re.search(pattern, text).group(1) in 성폭력_치료프로그램:
                    성폭력_치료프로그램[re.search(pattern, text).group(1)] += 1
                else:
                    성폭력_치료프로그램[re.search(pattern, text).group(1)] = 1

        if '피고인에 대한 정보' in text:
            pattern = r'\d+년'
            if bool(re.findall(pattern, text)):
                if re.findall(pattern, text)[0] in 피고인_정보공개:
                    피고인_정보공개[re.findall(pattern, text)[0]] += 1
                else:
                    피고인_정보공개[re.findall(pattern, text)[0]] = 1

        if '청소년 관련기관' in text:
            pattern = r'(\d+년).*취업제한'
            if bool(re.search(pattern, text)):
                if re.search(pattern, text).group(1) in 아동_청소년_장애인복지시설_취업제한:
                    아동_청소년_장애인복지시설_취업제한[re.search(pattern, text).group(1)] += 1
                else:
                    아동_청소년_장애인복지시설_취업제한[re.search(pattern, text).group(1)] = 1

        if '준법운전강의' in text:
            pattern = r'(\d+시간)의 준법운전강의'
            if bool(re.search(pattern, text)):
                if re.search(pattern, text).group(1) in 준법운전강의:
                    준법운전강의[re.search(pattern, text).group(1)] += 1
                else:
                    준법운전강의[re.search(pattern, text).group(1)] = 1


    전체 = {}

    전체['징역'] =  sum([sum(징역[key].values()) for key in 징역.keys() if 징역[key]])
    전체['금고'] =  sum([sum(금고[key].values()) for key in 금고.keys() if 금고[key]])

    if 벌금:
      전체['벌금'] = sum(벌금.values())

    if 보호관찰:
      전체['보호관찰'] = sum(보호관찰.values())

    if 사회봉사:
      전체['사회봉사'] = sum(사회봉사.values())

    if 성폭력_치료프로그램:
      전체['성폭력_치료프로그램'] = sum(성폭력_치료프로그램.values())

    if 피고인_정보공개:
      전체['피고인_정보공개'] = sum(피고인_정보공개.values())

    if 아동_청소년_장애인복지시설_취업제한:
      전체['아동_청소년_장애인복지시설_취업제한'] = sum(아동_청소년_장애인복지시설_취업제한.values())

    if 준법운전강의:
      전체['준법운전강의'] = sum(준법운전강의.values())

    def sort_dict(dictionary, limit=5):
        return dict(sorted(dictionary.items(), key=lambda x: x[1], reverse=True))

    # 각 범주에 대해 sort_dict 함수 적용
    전체 = sort_dict(전체)
    징역['실형'] = sort_dict(징역['실형'])
    징역['집행유예'] = sort_dict(징역['집행유예'])
    금고['실형'] = sort_dict(금고['실형'])
    금고['집행유예'] = sort_dict(금고['집행유예'])
    벌금 = sort_dict(벌금)
    사회봉사 = sort_dict(사회봉사)
    성폭력_치료프로그램 = sort_dict(성폭력_치료프로그램)
    피고인_정보공개 = sort_dict(피고인_정보공개)
    아동_청소년_장애인복지시설_취업제한 = sort_dict(아동_청소년_장애인복지시설_취업제한)
    준법운전강의 = sort_dict(준법운전강의)

    casename_dict = {'전체': 전체, '전체_징역': 전체['징역'], '전체_금고': 전체['금고'], '징역': 징역, '징역_실형' : 징역['실형'], '금고': 금고,
                    '금고_실형': 금고['실형'], '벌금': 벌금, '보호관찰': 보호관찰, '사회봉사': 사회봉사, '성폭력_치료프로그램': 성폭력_치료프로그램,
                    '피고인_정보공개': 피고인_정보공개, '아동_청소년_장애인복지시설_취업제한': 아동_청소년_장애인복지시설_취업제한, '준법운전강의': 준법운전강의}

    return casename_dict

if __name__ == "__main__":
  api_key = 'apikey'
  file_path = "C:/Users/gjaischool/Judi-AI/hh/"

  line = sys.stdin.buffer.readline().decode('utf-8')
  request = json.loads(line)

  # 요청 처리 및 결과 저장
  reply_text = chatbot(api_key, request)
  keyword = '사용자님의 상황을 요약하자면 :'
  if keyword in reply_text:
    index = reply_text.find(keyword)
    situation_text = reply_text[(index + len(keyword)):]
    df_similar_sentences = get_similar_sentences(api_key, file_path, situation_text, engine='text-embedding-ada-002')
    if (df_similar_sentences.empty):
        sentences = []
    else:
        sentences = [line for line in df_similar_sentences['ruling']]
    result_final = result_statistics(sentences)
    result_final['results'] = reply_text
  else:
    result_final = result_statistics([])
    result_final['results'] = reply_text

  # 결과를 클라이언트로 전송
  sys.stdout.reconfigure(encoding='utf-8')
  sys.stdout.write(json.dumps(result_final, ensure_ascii=False))
  sys.stdout.flush()