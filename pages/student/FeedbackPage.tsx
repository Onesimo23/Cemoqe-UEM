import React, { useEffect, useState } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import { Star, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, onSnapshot, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [myCourses, setMyCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    if (!user?.uid) { setMyCourses([]); setSelectedCourse(''); return; }
    const handleSnap = (snap: any) => {
      const list: Array<{ id: string; title: string }>= [];
      snap.docs.forEach((d: any) => {
        const data: any = d.data();
        const cid = data?.course_id || data?.courseId;
        if (!cid) return;
        list.push({ id: cid, title: data?.course_title || 'Curso' });
      });
      // dedup
      const map = new Map<string, { id: string; title: string }>();
      list.forEach(c => map.set(c.id, c));
      const arr = Array.from(map.values());
      setMyCourses(arr);
      if (!selectedCourse && arr.length) setSelectedCourse(arr[0].id);
    };
    const u1 = onSnapshot(query(collection(db, 'enrollments'), where('user_uid', '==', user.uid)), handleSnap);
    const u2 = onSnapshot(query(collection(db, 'enrollments'), where('userId', '==', user.uid)), handleSnap);
    return () => { u1(); u2(); };
  }, [user?.uid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Por favor, selecione uma nota!');
    if (!user?.uid || !selectedCourse) return alert('Selecione um curso.');
    (async () => {
      try {
        const rid = `${user.uid}_${selectedCourse}`;
        await setDoc(doc(db, 'reviews', rid), {
          user_uid: user.uid,
          course_id: selectedCourse,
          rating,
          comment: comment.trim() || null,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        }, { merge: true });
        setIsSent(true);
        setRating(0);
        setComment('');
        setTimeout(() => setIsSent(false), 4000);
      } catch (err) {
        console.error('Falha ao enviar avaliação', err);
        alert('Não foi possível enviar sua avaliação.');
      }
    })();
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sua Opinião é Importante</h1>
        <p className="text-gray-500 mb-8">Avalie os cursos que você concluiu e ajude-nos a melhorar sua experiência.</p>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Recent Evaluations List */}
          <div className="lg:col-span-2 space-y-4">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Meus Cursos</h3>
             {myCourses.length ? (
               myCourses.map(course => (
                 <button 
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedCourse === course.id ? 'bg-brand-green/5 border-brand-green shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                 >
                   <h4 className="font-bold text-gray-900 text-sm mb-1">{course.title}</h4>
                   <p className="text-xs text-gray-500">Curso</p>
                 </button>
               ))
             ) : (
               <div className="text-xs text-gray-500">Sem cursos disponíveis.</div>
             )}
          </div>

          {/* Feedback Form */}
          <div className="lg:col-span-3">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                {isSent ? (
                  <div className="text-center py-12 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Feedback Enviado!</h3>
                    <p className="text-gray-500">Obrigado por nos ajudar a crescer. Sua avaliação foi registrada.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-6 text-center">Como você avalia este curso?</h3>
                      <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-125"
                          >
                            <Star 
                              size={48} 
                              className={`transition-colors ${
                                (hoverRating || rating) >= star ? 'text-brand-accent fill-brand-accent' : 'text-gray-200'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                      <p className="text-center mt-4 text-sm font-bold text-brand-dark">
                        {rating === 1 && "Muito Insatisfeito"}
                        {rating === 2 && "Insatisfeito"}
                        {rating === 3 && "Regular"}
                        {rating === 4 && "Muito Bom"}
                        {rating === 5 && "Excelente!"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Seu Comentário (Opcional)</label>
                      <div className="relative">
                        <MessageCircle className="absolute top-3 left-4 text-gray-300 w-5 h-5" />
                        <textarea 
                          rows={6}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Conte-nos o que mais gostou e o que podemos melhorar..."
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-green/10 focus:border-brand-green outline-none resize-none text-sm"
                        ></textarea>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-brand-green text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-dark transition-all shadow-lg shadow-green-900/10"
                    >
                      <Send className="w-5 h-5" /> Enviar Minha Avaliação
                    </button>
                  </form>
                )}
             </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default FeedbackPage;