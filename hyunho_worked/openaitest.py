from openai import OpenAI
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import numpy as np

# client = OpenAI(
#     # defaults to os.environ.get("OPENAI_API_KEY")
#     api_key="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",
# )

# chat_completion = client.chat.completions.create(
#     messages=[
#         {
#             "role": "user",
#             "content": "Say this is a test",
#         }
#     ],
#     model="gpt-3.5-turbo",
# )

# print(chat_completion.choices[0].message.content)

def get_similar_sentences(api_key, data_path, input_sentence, engine='text-embedding-ada-002'):
    # API 키 설정
    client = OpenAI(api_key=api_key,)

    # 데이터 불러오기
    data = pd.read_csv(data_path)

    # 샘플만 사용하고 복사본을 만듭니다.
    data_sample = data.copy()

    # 'embedding' 열의 문자열을 NumPy 배열로 변환
    data_sample['embedding'] = data_sample['embedding'].apply(lambda x: np.array(eval(x)))

    # 유사도 계산
    input_sentence_embed = client.embeddings.create(input = input_sentence, model=engine).data[0].embedding

    input_fin = np.array(input_sentence_embed)  # 임베딩을 NumPy 배열로 변환

    query_2d = input_fin.reshape(1, -1)

    data_sample['similarity'] = data_sample['embedding'].apply(lambda x: cosine_similarity(x.reshape(1, -1), query_2d)[0][0])
    
    top_similar_sentence = data_sample.sort_values("similarity", ascending=False).head(3)[["casename", "facts", "ruling"]]
    
    # 유사한 문장 찾기
    return top_similar_sentence

api_key = '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'
data_path = "C:/Users/gh576/OneDrive/바탕 화면/JudiAI/hh/total_embedding_done.csv"
input_sentence = "피해자 B과 피고인 A은 과거 연인 사이였다. 피고인은 위 2021. 3. 7. 03:00경에서 같은 날 04:30경 사이 광주 서구 C, 3층에 있는 D주점 내 불상의 방에서 피해자 B이 자신을 폭행하였다는 이유로 피해자의 머리채를 잡아 바닥에 밀쳐놓고 피해자의 얼굴과 머리, 팔, 어깨 등을 손으로 수회 때리거나 발로 밟아 폭행하고, 다른 방으로 도망한 피해자를 찾아가 또다시 주먹으로 피해자의 얼굴을 2회 때리고 7~8회 가량 침을 뱉고 생수를 머리에 붓는 등 폭행하였다. 이로써 피고인은 피해자를 폭행하여 우측 후이개, 하악, 협부의 부종과 잠깐의 의식소실 및 후두부 타박으로 인한 압통 등 약 2주간의 치료를 필요로 하는 상해를 가하였다."
results = get_similar_sentences(api_key, data_path, input_sentence)
print(results)
