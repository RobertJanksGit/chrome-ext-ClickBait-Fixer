import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content:
        "Rewrite the following headline to be factual and less sensational. Make sure to keep the headline six words or less:",
    },
    {
      role: "user",
      content:
        "Headline: Killer clown John Wayne Gacy issued warning about victims in final words before lethal injection, Context: 'Killer clown' John Wayne Gacy had a chilling admission before being given the lethal injection after spending years on death row for his horrific crimes. The American convict was one of the most notorious criminals of his time, a known serial killer and rapist who was responsible for killing at least 33 boys and men in Chicago. Each murder was carried out in Gacy's home in Norwood Park, with the bodies later being found buried in his garden.",
    },
  ],
});

console.log(completion.choices[0].message);
